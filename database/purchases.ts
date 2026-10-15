import { tMessage } from '../i18n'
import type {
    IPurchaseDetail,
    IPurchaseItem,
    IPurchaseWithSeller,
    ISellerStat,
} from '../types/database'
import { insertMany } from './batch'
import { DatabaseError, DbExecutor, initDb } from './connection'
import { fromMinor, lineTotalMinor, toMinor } from './money'
import { initializeSchema } from './schema'
import {
    assertSellerExists,
    clampPageLimit,
    escapeLikePattern,
    fetchOwedAndPaid,
} from './sql'

export async function initializePurchases(): Promise<void> {
    await initializeSchema()
}

export interface NewPurchaseItem {
    price_id: number | null
    category: string
    unit: string
    /** Major units (e.g. 9.99); converted to minor units at the SQL boundary. */
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
 * Builds the shared filter predicate for purchase queries (page + summary so
 * they can never drift). `query` matches, case-insensitively: seller name, any
 * line-item category/unit, the purchase total, or the created_at date.
 */
function buildPurchaseFilters(options: { sellerId?: number; query?: string }): {
    clauses: string[]
    params: Array<string | number>
} {
    const clauses: string[] = []
    const params: Array<string | number> = []

    if (options.sellerId !== undefined) {
        clauses.push('p.seller_id = ?')
        params.push(options.sellerId)
    }

    const q = options.query?.trim()
    if (q) {
        const like = `%${escapeLikePattern(q)}%`
        clauses.push(
            `(s.name LIKE ? ESCAPE '\\' COLLATE NOCASE
              OR EXISTS (
                  SELECT 1 FROM purchase_items i
                  WHERE i.purchase_id = p.id
                    AND (i.category LIKE ? ESCAPE '\\' COLLATE NOCASE OR i.unit LIKE ? ESCAPE '\\' COLLATE NOCASE)
              )
              OR CAST(p.total AS TEXT) LIKE ? ESCAPE '\\'
              OR p.created_at LIKE ? ESCAPE '\\')`
        )
        params.push(like, like, like, like, like)
    }

    return { clauses, params }
}

function toMajorItem(item: IPurchaseItem): IPurchaseItem {
    return { ...item, unit_price: fromMinor(item.unit_price), line_total: fromMinor(item.line_total) }
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
        list.push(toMajorItem(item))
        byPurchase.set(item.purchase_id, list)
    }
    return purchases.map((p) => ({ ...p, total: fromMinor(p.total), items: byPurchase.get(p.id) ?? [] }))
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
 * LIMIT/OFFSET windows do. Pass `sellerId` to scope to one seller.
 */
export async function fetchPurchasesPage(options: { limit: number; cursor?: number; query?: string; sellerId?: number }): Promise<PurchasesPage> {
    let db;
    try {
        db = initDb()
        const { cursor, query, sellerId } = options
        const limit = clampPageLimit(options.limit)

        const filters = buildPurchaseFilters({ sellerId, query })
        const where = [...filters.clauses]
        const params = [...filters.params]
        if (cursor !== undefined) {
            // Cursor is prepended so it leads predicate evaluation.
            where.unshift('p.id < ?')
            params.unshift(cursor)
        }
        const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''

        // Fetch one extra row to detect whether another page exists.
        // `has_payment` marks purchases a payment has been linked to.
        const { results } = await db.executeAsync(
            `
            SELECT p.*, s.name AS seller_name,
                   EXISTS (SELECT 1 FROM payments py WHERE py.purchase_id = p.id) AS has_payment
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
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

export interface PurchasesSummary {
    count: number
    total: number
}

/**
 * Aggregate over all purchases matching the same filters as `fetchPurchasesPage`
 * (independent of pagination), so the history header can show accurate totals.
 */
export async function fetchPurchasesSummary(options: { query?: string; sellerId?: number } = {}): Promise<PurchasesSummary> {
    let db;
    try {
        db = initDb()
        const { clauses, params } = buildPurchaseFilters(options)
        const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''
        const { results } = await db.executeAsync(
            `SELECT COUNT(*) AS count, COALESCE(SUM(p.total), 0) AS total
             FROM purchases p
             LEFT JOIN sellers s ON s.id = p.seller_id
             ${whereSql}`,
            params
        );
        const row = (results as unknown as Array<{ count: number; total: number }>)[0]
        return { count: row?.count ?? 0, total: fromMinor(row?.total ?? 0) }
    } catch (error) {
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

export async function countPurchases(query?: string, sellerId?: number): Promise<number> {
    const { count } = await fetchPurchasesSummary({ query, sellerId })
    return count
}

/**
 * A purchase header is locked once a payment has been initialized against it
 * (`payments.purchase_id` references this purchase). Sellers' payments are
 * allocated to their purchases oldest-first, so the paid purchases are the
 * locked ones and the remaining still-owed purchases stay editable.
 * Must be called inside a transaction.
 */
async function isPurchaseLocked(db: DbExecutor, purchaseId: number): Promise<boolean> {
    const { results } = await db.executeAsync(
        `SELECT 1 FROM payments WHERE purchase_id = ? LIMIT 1`,
        [purchaseId]
    )
    return (results as unknown as unknown[]).length > 0
}

/**
 * Blocks a mutation that would leave the seller with more paid than owed.
 * Totals are integer minor units; `newTotalMinor` is the purchase's total
 * after the change (0 when deleting). Must be called inside a transaction.
 */
async function assertSellerNotOverpaid(
    db: DbExecutor,
    sellerId: number,
    oldTotalMinor: number,
    newTotalMinor: number
): Promise<void> {
    const { owed, paid } = await fetchOwedAndPaid(db, sellerId)
    if (paid - (owed - oldTotalMinor + newTotalMinor) > 0) {
        throw new DatabaseError(tMessage('ERROR_PURCHASE_OVERPAY'))
    }
}

/** Throws when the price id does not reference an existing price row. */
async function assertPriceExists(db: DbExecutor, priceId: number): Promise<void> {
    const { results } = await db.executeAsync(
        `SELECT id FROM prices WHERE id = ? LIMIT 1`,
        [priceId]
    )
    if ((results as unknown as unknown[]).length === 0) {
        throw new DatabaseError(tMessage('ERROR_PRICE_NOT_FOUND'))
    }
}

const PURCHASE_ITEM_COLUMNS = [
    'purchase_id',
    'price_id',
    'category',
    'unit',
    'unit_price',
    'quantity',
    'line_total',
]

/** Maps validated line items into bound-parameter tuples for a bulk insert. */
function toPurchaseItemRows(purchaseId: number, items: NewPurchaseItem[]) {
    return items.map((item) => [
        purchaseId,
        item.price_id ?? null,
        item.category.trim(),
        item.unit.trim(),
        toMinor(item.unit_price),
        item.quantity,
        lineTotalMinor(item.unit_price, item.quantity),
    ])
}

function validateItems(items: NewPurchaseItem[]): void {
    if (!Array.isArray(items) || items.length === 0) {
        throw new DatabaseError(tMessage('ERROR_NO_ITEMS'))
    }
    for (const item of items) {
        if (!item.category?.trim() || !item.unit?.trim()) {
            throw new DatabaseError(tMessage('ERROR_INVALID_INPUT'))
        }
        if (!Number.isFinite(item.unit_price) || item.unit_price <= 0) {
            throw new DatabaseError(tMessage('ERROR_INVALID_INPUT'))
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new DatabaseError(tMessage('ERROR_INVALID_QUANTITY'))
        }
    }
}

/** Sums validated line totals in minor units (exact integer arithmetic). */
function totalMinor(items: NewPurchaseItem[]): number {
    return items.reduce((sum, item) => sum + lineTotalMinor(item.unit_price, item.quantity), 0)
}

async function assertItemPricesExist(db: DbExecutor, items: NewPurchaseItem[]): Promise<void> {
    const ids = [...new Set(items.map((item) => item.price_id).filter((id): id is number => id != null))]
    for (const id of ids) {
        await assertPriceExists(db, id)
    }
}

export async function createPurchase(data: NewPurchase): Promise<number> {
    let db;
    try {
        const { seller_id, items } = data
        validateItems(items)
        const total = totalMinor(items)
        if (total <= 0) {
            throw new DatabaseError(tMessage('ERROR_INVALID_INPUT'))
        }

        db = initDb()
        return await db.transaction(async (tx) => {
            if (seller_id != null) {
                await assertSellerExists(tx, seller_id, new DatabaseError(tMessage('ERROR_INVALID_INPUT')))
            }
            await assertItemPricesExist(tx, items)
            const { insertId } = await tx.executeAsync(
                `INSERT INTO purchases (seller_id, total) VALUES (?, ?)`,
                [seller_id ?? null, total]
            )
            const purchaseId = insertId as number
            await insertMany(tx, 'purchase_items', PURCHASE_ITEM_COLUMNS, toPurchaseItemRows(purchaseId, items))
            return purchaseId
        })
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

export async function updatePurchase(id: number, updates: PurchaseUpdates): Promise<void> {
    let db;
    try {
        db = initDb()
        await db.transaction(async (tx) => {
            if (await isPurchaseLocked(tx, id)) {
                throw new DatabaseError(tMessage('ERROR_PURCHASE_LOCKED'))
            }
            const current = (await tx.executeAsync(
                `SELECT seller_id, total FROM purchases WHERE id = ? LIMIT 1`,
                [id]
            )).results as unknown as Array<{ seller_id: number | null; total: number }>
            const existing = current[0]
            if (!existing) {
                throw new DatabaseError(tMessage('ERROR_PURCHASE_NOT_FOUND'))
            }
            if (updates.items !== undefined) {
                validateItems(updates.items)
                await assertItemPricesExist(tx, updates.items)
            }
            const newTotal = updates.items === undefined ? existing.total : totalMinor(updates.items)
            const sellerChanging = updates.seller_id !== undefined && updates.seller_id !== existing.seller_id
            if (!sellerChanging) {
                // Same owner (or no seller change): the purchase total moves
                // from oldTotal to newTotal under the current seller.
                if (existing.seller_id != null) {
                    await assertSellerNotOverpaid(tx, existing.seller_id, existing.total, newTotal)
                }
            } else {
                // Owner changes: the old seller loses the whole purchase
                // (newTotal 0) and the new seller gains it (from 0 to newTotal).
                if (existing.seller_id != null) {
                    await assertSellerNotOverpaid(tx, existing.seller_id, existing.total, 0)
                }
                if (updates.seller_id != null) {
                    await assertSellerExists(tx, updates.seller_id, new DatabaseError(tMessage('ERROR_INVALID_INPUT')))
                    await assertSellerNotOverpaid(tx, updates.seller_id, 0, newTotal)
                }
            }
            if (updates.seller_id !== undefined) {
                await tx.executeAsync(
                    `UPDATE purchases SET seller_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                    [updates.seller_id ?? null, id]
                )
            }
            if (updates.items !== undefined) {
                await tx.executeAsync(`DELETE FROM purchase_items WHERE purchase_id = ?`, [id])
                await insertMany(tx, 'purchase_items', PURCHASE_ITEM_COLUMNS, toPurchaseItemRows(id, updates.items))
                await tx.executeAsync(
                    `UPDATE purchases SET total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                    [newTotal, id]
                )
            }
        })
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

export async function deletePurchase(id: number): Promise<void> {
    let db;
    try {
        db = initDb()
        // Guard + delete in a queued transaction so a payment recorded
        // concurrently cannot slip in between the check and the delete.
        await db.transaction(async (tx) => {
            if (await isPurchaseLocked(tx, id)) {
                throw new DatabaseError(tMessage('ERROR_PURCHASE_LOCKED'))
            }
            const current = (await tx.executeAsync(
                `SELECT seller_id, total FROM purchases WHERE id = ? LIMIT 1`,
                [id]
            )).results as unknown as Array<{ seller_id: number | null; total: number }>
            const existing = current[0]
            if (!existing) {
                throw new DatabaseError(tMessage('ERROR_PURCHASE_NOT_FOUND'))
            }
            // Deleting removes this purchase's total from what the seller is owed.
            if (existing.seller_id != null) {
                await assertSellerNotOverpaid(tx, existing.seller_id, existing.total, 0)
            }
            await tx.executeAsync(`DELETE FROM purchases WHERE id = ?`, [id])
        })
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
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
        const rows = results as unknown as ISellerStat[]
        return rows.map((row) => ({ ...row, total_spent: fromMinor(row.total_spent) }))
    } catch (error) {
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

/** Loads the most recent purchases for one seller in a single bounded page. */
export async function fetchRecentPurchasesBySeller(sellerId: number, limit = 3): Promise<IPurchaseDetail[]> {
    const { items } = await fetchPurchasesPage({ limit, sellerId })
    return items
}

/**
 * Seller purchases that no payment has been linked to yet, oldest first (the
 * order payments settle them). Used to show what a payment is being made for.
 */
export async function fetchUnpaidPurchasesBySeller(sellerId: number, limit = 5): Promise<IPurchaseDetail[]> {
    let db;
    try {
        db = initDb()
        const clamped = clampPageLimit(limit)
        const { results } = await db.executeAsync(
            `
            SELECT p.*, s.name AS seller_name,
                   EXISTS (SELECT 1 FROM payments py WHERE py.purchase_id = p.id) AS has_payment
            FROM purchases p
            LEFT JOIN sellers s ON s.id = p.seller_id
            WHERE p.seller_id = ?
              AND NOT EXISTS (SELECT 1 FROM payments py WHERE py.purchase_id = p.id)
            ORDER BY p.id ASC
            LIMIT ?
            `,
            [sellerId, clamped]
        )
        return attachItems(db, results as unknown as IPurchaseWithSeller[])
    } catch (error) {
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}
