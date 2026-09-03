import { MESSAGES } from '../constants'
import type { IPurchase, IPurchaseWithSeller, ISellerStat } from '../types/database'
import { DatabaseError, initDb } from './connection'
import { initializeSchema } from './schema'

export async function initializePurchases(): Promise<void> {
    try {
        await initializeSchema()
    } catch (error) {
        throw new DatabaseError('Failed to initialize purchases table', error)
    }
}

export async function fetchPurchases(): Promise<IPurchaseWithSeller[]> {
    const { items } = await fetchPurchasesPage({ limit: 100 })
    return items
}

export interface PurchasesPage {
    items: IPurchaseWithSeller[]
    /** id of the last item of this page; null when there are no more rows */
    nextCursor: number | null
}

/**
 * Keyset pagination over purchases (id DESC).
 * The cursor is the id of the last row of the previous page, so inserts
 * between page loads can no longer skip or duplicate rows the way
 * LIMIT/OFFSET windows do.
 */
/**
 * Escape LIKE wildcards so a search for `100%` or `a_b` matches literally.
 * Backslash is the ESCAPE character used in the queries below.
 */
export function escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, (char) => `\\${char}`)
}

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
            where.push(`(p.category LIKE ? ESCAPE '\\' COLLATE NOCASE OR s.name LIKE ? ESCAPE '\\' COLLATE NOCASE)`)
            params.push(like, like)
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
        return { items, nextCursor: hasMore && last ? last.id : null }
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
                `SELECT COUNT(*) as count FROM purchases p LEFT JOIN sellers s ON s.id = p.seller_id WHERE p.category LIKE ? ESCAPE '\\' COLLATE NOCASE OR s.name LIKE ? ESCAPE '\\' COLLATE NOCASE`,
                [like, like]
            );
            return (results as unknown as Array<{ count: number }>)[0]?.count ?? 0
        }
        const { results } = await db.executeAsync(`SELECT COUNT(*) as count FROM purchases`);
        return (results as unknown as Array<{ count: number }>)[0]?.count ?? 0
    } catch (error) {
        throw new DatabaseError('Failed to count purchases', error)
    }
}

export async function createPurchase(purchaseData: Omit<IPurchase, 'id'>): Promise<number> {
    let db;
    try {
        const { price_id, seller_id, category, unit, unit_price, quantity, total } = purchaseData;

        if (!price_id || !category || !unit) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
        }
        if (!unit_price || unit_price <= 0) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
        }
        if (!quantity || !Number.isInteger(quantity) || quantity <= 0) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_QUANTITY)
        }
        if (!total || total <= 0) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
        }

        db = initDb()
        const { insertId } = await db.executeAsync(`
            INSERT INTO purchases (price_id, seller_id, category, unit, unit_price, quantity, total)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [price_id, seller_id ?? null, category, unit, unit_price, quantity, total]);

        return insertId as number;
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to create purchase', error)
    }
}

export async function updatePurchase(
    id: number,
    updates: { quantity?: number; seller_id?: number | null }
): Promise<void> {
    let db;
    try {
        const setClauses: string[] = []
        const values: Array<string | number | null> = []

        if (updates.quantity !== undefined) {
            if (!Number.isInteger(updates.quantity) || updates.quantity <= 0) {
                throw new DatabaseError(MESSAGES.ERROR_INVALID_QUANTITY)
            }
            setClauses.push('quantity = ?', 'total = unit_price * ?')
            values.push(updates.quantity, updates.quantity)
        }
        if (updates.seller_id !== undefined) {
            setClauses.push('seller_id = ?')
            values.push(updates.seller_id ?? null)
        }
        if (setClauses.length === 0) {
            return
        }

        db = initDb()
        await db.executeAsync(
            `UPDATE purchases SET ${setClauses.join(', ')} WHERE id = ?`,
            [...values, id]
        )
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to update purchase', error)
    }
}

export async function deletePurchase(id: number): Promise<void> {
    let db;
    try {
        db = initDb()
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

export async function fetchPurchasesBySeller(sellerId: number, limit = 100): Promise<IPurchaseWithSeller[]> {
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
        return results as unknown as IPurchaseWithSeller[]
    } catch (error) {
        throw new DatabaseError('Failed to fetch purchases for seller', error)
    }
}
