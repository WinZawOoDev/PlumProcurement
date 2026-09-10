import { MESSAGES } from '../constants'
import type {
    IPurchaseDetail,
    IPurchaseItem,
    IPurchaseWithSeller,
    ISellerStat,
} from '../types/database'
import { DatabaseError, initDb } from './connection'
import { initializeSchema } from './schema'

export async function initializePurchases(): Promise<void> {
    try {
        await initializeSchema()
    } catch (error) {
        throw new DatabaseError('Failed to initialize purchases table', error)
    }
}

export interface NewPurchaseItem {
    price_id: number | null
    category: string
    unit: string
    unit_price: number
    quantity: number
}

export interface NewPurchase {
    seller_id: number | null
    items: NewPurchaseItem[]
}

export interface PurchaseUpdates {
    seller_id?: number | null
    items?: NewPurchaseItem[]
}

export interface PurchasesPage {
    items: IPurchaseDetail[]
    /** id of the last item of this page; null when there are no more rows */
    nextCursor: number | null
}

/**
 * Escape LIKE wildcards so a search for `100%` or `a_b` matches literally.
 * Backslash is the ESCAPE character used in the queries below.
 */
export function escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, (char) => `\\${char}`)
}

/** Loads the line items for a page of purchase headers and assembles details. */
async function attachItems(db: ReturnType<typeof initDb>, purchases: IPurchaseWithSeller[]): Promise<IPurchaseDetail[]> {
    if (purchases.length === 0) return []
    const placeholders = purchases.map(() => '?').join(',')
    const { results } = await db.executeAsync(
        `SELECT * FROM purchase_items WHERE purchase_id IN (${placeholders}) ORDER BY purchase_id ASC, id ASC`,
        purchases.map((p) => p.id)
    )
    const rows = results as unknown as IPurchaseItem[]
    const byPurchase = new Map<number, IPurchaseItem[]>()
    for (const item of rows) {
        const list = byPurchase.get(item.purchase_id) ?? []
        list.push(item)
        byPurchase.set(item.purchase_id, list)
    }
    return purchases.map((p) => ({ ...p, items: byPurchase.get(p.id) ?? [] }))
}

/**
 * Loads the most recent purchases (header + line items) in a single bounded
 * page. Callers that need the overall total should pair this with
 * `countPurchases()` instead of loading every row.
 */
export async function fetchRecentPurchases(limit = 4): Promise<IPurchaseDetail[]> {
    const { items } = await fetchPurchasesPage({ limit })
    return items
}

/**
 * Keyset pagination over purchases (id DESC).
 * The cursor is the id of the last row of the previous page, so inserts
 * between page loads can no longer skip or duplicate rows the way
 * LIMIT/OFFSET windows do.
 */
export async function fetchPurchasesPage(options: { limit: number; cursor?: number; query?: string }): Promise<PurchasesPage> {
    let db;
    try {
        db = initDb()
        const { limit, cursor, query } = options
        const q = query?.trim()

        const where: string[] = []
        const params: Array<string | number> = []
        if (cursor !== undefined) {
            where.push('p.id < ?')
            params.push(cursor)
        }
        if (q) {
            const like = `%${escapeLikePattern(q)}%`
            // Search by seller name or any line item category/unit.
            where.push(
                `(s.name LIKE ? ESCAPE '\\' COLLATE NOCASE OR EXISTS (
                    SELECT 1 FROM purchase_items i
                    WHERE i.purchase_id = p.id
                      AND (i.category LIKE ? ESCAPE '\\' COLLATE NOCASE OR i.unit LIKE ? ESCAPE '\\' COLLATE NOCASE)
                ))`
            )
            params.push(like, like, like)
        }
        const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''

        // Fetch one extra row to detect whether another page exists
        const { results } = await db.executeAsync(
            `
            SELECT p.*, s.name AS seller_name
            FROM purchases p
            LEFT JOIN sellers s ON s.id = p.seller_id
            ${whereSql}
            ORDER BY p.id DESC LIMIT ?
        `,
            [...params, limit + 1]
        );
        const rows = results as unknown as IPurchaseWithSeller[]
        const hasMore = rows.length > limit
        const items = hasMore ? rows.slice(0, limit) : rows
        const last = items[items.length - 1]
        const details = await attachItems(db, items)
        return { items: details, nextCursor: hasMore && last ? last.id : null }
    } catch (error) {
        throw new DatabaseError('Failed to fetch purchases', error)
    }
}

export async function countPurchases(query?: string): Promise<number> {
    let db;
    try {
        db = initDb()
        const q = query?.trim()
        if (q) {
            const like = `%${escapeLikePattern(q)}%`
            const { results } = await db.executeAsync(
                `SELECT COUNT(*) as count
                 FROM purchases p
                 LEFT JOIN sellers s ON s.id = p.seller_id
                 WHERE s.name LIKE ? ESCAPE '\\' COLLATE NOCASE OR EXISTS (
                     SELECT 1 FROM purchase_items i
                     WHERE i.purchase_id = p.id
                       AND (i.category LIKE ? ESCAPE '\\' COLLATE NOCASE OR i.unit LIKE ? ESCAPE '\\' COLLATE NOCASE)
                 )`,
                [like, like, like]
            );
            return (results as unknown as Array<{ count: number }>)[0]?.count ?? 0
        }
        const { results } = await db.executeAsync(`SELECT COUNT(*) as count FROM purchases`);
        return (results as unknown as Array<{ count: number }>)[0]?.count ?? 0
    } catch (error) {
        throw new DatabaseError('Failed to count purchases', error)
    }
}

function validateItems(items: NewPurchaseItem[]): void {
    if (!Array.isArray(items) || items.length === 0) {
        throw new DatabaseError(MESSAGES.ERROR_NO_ITEMS)
    }
    for (const item of items) {
        if (!item.category || !item.unit) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
        }
        if (!item.unit_price || item.unit_price <= 0) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
        }
        if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_QUANTITY)
        }
    }
}

export async function createPurchase(data: NewPurchase): Promise<number> {
    let db;
    try {
        const { seller_id, items } = data
        validateItems(items)
        const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
        if (total <= 0) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
        }

        db = initDb()
        await db.executeAsync(`BEGIN IMMEDIATE`)
        try {
            const { insertId } = await db.executeAsync(
                `INSERT INTO purchases (seller_id, total) VALUES (?, ?)`,
                [seller_id ?? null, total]
            )
            const purchaseId = insertId as number
            for (const item of items) {
                await db.executeAsync(
                    `INSERT INTO purchase_items (purchase_id, price_id, category, unit, unit_price, quantity, line_total)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        purchaseId,
                        item.price_id ?? null,
                        item.category,
                        item.unit,
                        item.unit_price,
                        item.quantity,
                        item.unit_price * item.quantity,
                    ]
                )
            }
            await db.executeAsync(`COMMIT`)
            return purchaseId
        } catch (innerError) {
            await db.executeAsync(`ROLLBACK`).catch(() => undefined)
            throw innerError
        }
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to create purchase', error)
    }
}

export async function updatePurchase(id: number, updates: PurchaseUpdates): Promise<void> {
    let db;
    try {
        db = initDb()
        await db.executeAsync(`BEGIN IMMEDIATE`)
        try {
            if (updates.seller_id !== undefined) {
                await db.executeAsync(
                    `UPDATE purchases SET seller_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                    [updates.seller_id ?? null, id]
                )
            }
            if (updates.items !== undefined) {
                validateItems(updates.items)
                const total = updates.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
                await db.executeAsync(`DELETE FROM purchase_items WHERE purchase_id = ?`, [id])
                for (const item of updates.items) {
                    await db.executeAsync(
                        `INSERT INTO purchase_items (purchase_id, price_id, category, unit, unit_price, quantity, line_total)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            id,
                            item.price_id ?? null,
                            item.category,
                            item.unit,
                            item.unit_price,
                            item.quantity,
                            item.unit_price * item.quantity,
                        ]
                    )
                }
                await db.executeAsync(
                    `UPDATE purchases SET total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                    [total, id]
                )
            }
            await db.executeAsync(`COMMIT`)
        } catch (innerError) {
            await db.executeAsync(`ROLLBACK`).catch(() => undefined)
            throw innerError
        }
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to update purchase', error)
    }
}

export async function deletePurchase(id: number): Promise<void> {
    let db;
    try {
        db = initDb()
        // Line items cascade; linked payments keep purchase_id set to NULL.
        await db.executeAsync(`DELETE FROM purchases WHERE id = ?`, [id])
    } catch (error) {
        throw new DatabaseError('Failed to delete purchase', error)
    }
}

export async function fetchSellerStats(): Promise<ISellerStat[]> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(
            `SELECT seller_id, COUNT(*) AS purchase_count, SUM(total) AS total_spent
             FROM purchases
             WHERE seller_id IS NOT NULL
             GROUP BY seller_id`
        )
        return results as unknown as ISellerStat[]
    } catch (error) {
        throw new DatabaseError('Failed to fetch seller stats', error)
    }
}

export async function fetchPurchasesBySeller(sellerId: number, limit = 100): Promise<IPurchaseDetail[]> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(
            `
            SELECT p.*, s.name AS seller_name
            FROM purchases p
            LEFT JOIN sellers s ON s.id = p.seller_id
            WHERE p.seller_id = ?
            ORDER BY p.id DESC LIMIT ?
        `,
            [sellerId, limit]
        )
        const rows = results as unknown as IPurchaseWithSeller[]
        return attachItems(db, rows)
    } catch (error) {
        throw new DatabaseError('Failed to fetch purchases for seller', error)
    }
}
