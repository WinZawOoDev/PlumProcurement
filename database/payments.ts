import { tMessage } from '../i18n'
import type { IPayment, ISellerPaymentStat } from '../types/database'
import { DatabaseError, DbExecutor, initDb } from './connection'
import { initializeSchema } from './schema'

export async function initializePayments(): Promise<void> {
    try {
        await initializeSchema()
    } catch (error) {
        throw new DatabaseError('Failed to initialize payments table', error)
    }
}

async function fetchOwedAndPaid(db: DbExecutor, sellerId: number, excludePaymentId?: number): Promise<{ owed: number; paid: number }> {
    const owedResults = await db.executeAsync(
        `SELECT COALESCE(SUM(total), 0) AS total FROM purchases WHERE seller_id = ?`,
        [sellerId]
    )
    const owed = (owedResults.results as unknown as Array<{ total: number }>)[0]?.total ?? 0

    const excludeSql = excludePaymentId !== undefined ? ' AND id != ?' : ''
    const paidParams = excludePaymentId !== undefined ? [sellerId, excludePaymentId] : [sellerId]
    const paidResults = await db.executeAsync(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE seller_id = ?${excludeSql}`,
        paidParams
    )
    const paid = (paidResults.results as unknown as Array<{ total: number }>)[0]?.total ?? 0
    return { owed, paid }
}

/**
 * Rebuilds a seller's payment -> purchase links using the canonical FIFO rule
 * (oldest payment settles the oldest purchase, 1:1; payments beyond the
 * purchase count are left unlinked). Must be called inside a transaction
 * whenever a payment is removed, otherwise the deleted payment's purchase
 * stays linked — leaving the wrong purchase locked against edit/delete.
 */
async function reallocateSellerPayments(db: DbExecutor, sellerId: number): Promise<void> {
    // One statement for the whole seller: for each payment, the offset is the
    // number of older payments, so it maps onto the purchase at that offset
    // (or NULL when out of range). Avoids the previous N+1 of one UPDATE per
    // payment link.
    await db.executeAsync(
        `UPDATE payments
         SET purchase_id = (
             SELECT p.id
             FROM purchases p
             WHERE p.seller_id = payments.seller_id
             ORDER BY p.id ASC
             LIMIT 1 OFFSET (
                 SELECT COUNT(*)
                 FROM payments earlier
                 WHERE earlier.seller_id = payments.seller_id
                   AND earlier.id < payments.id
             )
         )
         WHERE seller_id = ?`,
        [sellerId]
    )
}

export interface PaymentsPage {
    items: IPayment[]
    /** id of the last item of this page; null when there are no more rows */
    nextCursor: number | null
}

/**
 * Keyset pagination over a seller's payments (id DESC). The cursor is the id
 * of the last row of the previous page so concurrent inserts cannot shift the
 * window the way LIMIT/OFFSET would.
 */
export async function fetchPaymentsPage(options: { sellerId: number; limit: number; cursor?: number }): Promise<PaymentsPage> {
    let db;
    try {
        db = initDb()
        const { sellerId, limit, cursor } = options
        const where = ['seller_id = ?']
        const params: number[] = [sellerId]
        if (cursor !== undefined) {
            where.push('id < ?')
            params.push(cursor)
        }
        const { results } = await db.executeAsync(
            `SELECT * FROM payments WHERE ${where.join(' AND ')} ORDER BY id DESC LIMIT ?`,
            [...params, limit + 1]
        )
        const rows = results as unknown as IPayment[]
        const hasMore = rows.length > limit
        const items = hasMore ? rows.slice(0, limit) : rows
        const last = items[items.length - 1]
        return { items, nextCursor: hasMore && last ? last.id : null }
    } catch (error) {
        throw new DatabaseError('Failed to fetch payments for seller', error)
    }
}

/** Loads the most recent payments for one seller in a single bounded page. */
export async function fetchRecentPaymentsBySeller(sellerId: number, limit = 3): Promise<IPayment[]> {
    const { items } = await fetchPaymentsPage({ sellerId, limit })
    return items
}

export async function fetchPaymentSummaries(): Promise<ISellerPaymentStat[]> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(
            `
            SELECT s.id AS seller_id, s.name AS seller_name,
                COALESCE((SELECT SUM(p.total) FROM purchases p WHERE p.seller_id = s.id), 0) AS total_owed,
                COALESCE((SELECT SUM(py.amount) FROM payments py WHERE py.seller_id = s.id), 0) AS total_paid
            FROM sellers s
            ORDER BY s.name ASC
            `
        )
        const rows = results as unknown as Array<Omit<ISellerPaymentStat, 'balance'>>
        return rows.map((row) => ({ ...row, balance: row.total_owed - row.total_paid }))
    } catch (error) {
        throw new DatabaseError('Failed to fetch payment summaries', error)
    }
}

export async function fetchSellerPaymentStat(sellerId: number): Promise<ISellerPaymentStat | null> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(
            `
            SELECT s.id AS seller_id, s.name AS seller_name,
                COALESCE((SELECT SUM(p.total) FROM purchases p WHERE p.seller_id = s.id), 0) AS total_owed,
                COALESCE((SELECT SUM(py.amount) FROM payments py WHERE py.seller_id = s.id), 0) AS total_paid
            FROM sellers s
            WHERE s.id = ?
            `,
            [sellerId]
        )
        const rows = results as unknown as Array<Omit<ISellerPaymentStat, 'balance'>>
        if (rows.length === 0) return null
        return { ...rows[0], balance: rows[0].total_owed - rows[0].total_paid }
    } catch (error) {
        throw new DatabaseError('Failed to fetch payment stat for seller', error)
    }
}

export async function createPayment(data: Omit<IPayment, 'id'>): Promise<number> {
    let db;
    try {
        const { seller_id, purchase_id, amount, method, note } = data
        if (!seller_id) {
            throw new DatabaseError(tMessage('ERROR_INVALID_INPUT'))
        }
        if (!amount || amount <= 0) {
            throw new DatabaseError(tMessage('ERROR_INVALID_AMOUNT'))
        }

        db = initDb()
        return await db.transaction(async (tx) => {
            const { owed, paid } = await fetchOwedAndPaid(tx, seller_id)
            if (amount > owed - paid) {
                throw new DatabaseError(tMessage('ERROR_PAYMENT_EXCEEDS_BALANCE'))
            }
            // Explicit link wins; otherwise settle the seller's oldest purchase
            // that no payment has been linked to yet (FIFO).
            let linkedPurchaseId = purchase_id ?? null
            if (linkedPurchaseId === null) {
                const { results } = await tx.executeAsync(
                    `SELECT p.id FROM purchases p
                     WHERE p.seller_id = ?
                       AND NOT EXISTS (SELECT 1 FROM payments pay WHERE pay.purchase_id = p.id)
                     ORDER BY p.id ASC LIMIT 1`,
                    [seller_id]
                )
                linkedPurchaseId = (results as unknown as Array<{ id: number }>)[0]?.id ?? null
            }
            const { insertId } = await tx.executeAsync(
                `INSERT INTO payments (seller_id, purchase_id, amount, method, note) VALUES (?, ?, ?, ?, ?)`,
                [seller_id, linkedPurchaseId, amount, method ?? null, note ?? null]
            )
            return insertId as number
        })
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to create payment', error)
    }
}

export async function updatePayment(
    id: number,
    updates: { amount?: number; method?: string | null; note?: string | null }
): Promise<void> {
    let db;
    try {
        const setClauses: string[] = []
        const values: Array<string | number | null> = []

        if (updates.amount !== undefined) {
            if (updates.amount <= 0) {
                throw new DatabaseError(tMessage('ERROR_INVALID_AMOUNT'))
            }
            setClauses.push('amount = ?')
            values.push(updates.amount)
        }
        if (updates.method !== undefined) {
            setClauses.push('method = ?')
            values.push(updates.method)
        }
        if (updates.note !== undefined) {
            setClauses.push('note = ?')
            values.push(updates.note)
        }
        if (setClauses.length === 0) return

        db = initDb()
        await db.transaction(async (tx) => {
            if (updates.amount !== undefined) {
                const { results } = await tx.executeAsync(
                    `SELECT seller_id, amount FROM payments WHERE id = ? LIMIT 1`,
                    [id]
                )
                const existing = (results as unknown as Array<{ seller_id: number; amount: number }>)[0]
                if (existing) {
                    const { owed, paid } = await fetchOwedAndPaid(tx, existing.seller_id, id)
                    const balanceWithoutThis = owed - paid
                    if (updates.amount > balanceWithoutThis) {
                        throw new DatabaseError(tMessage('ERROR_PAYMENT_EXCEEDS_BALANCE'))
                    }
                }
            }
            await tx.executeAsync(
                `UPDATE payments SET ${setClauses.join(', ')} WHERE id = ?`,
                [...values, id]
            )
        })
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to update payment', error)
    }
}

export async function deletePayment(id: number): Promise<void> {
    let db;
    try {
        db = initDb()
        await db.transaction(async (tx) => {
            const { results } = await tx.executeAsync(
                `SELECT seller_id FROM payments WHERE id = ? LIMIT 1`,
                [id]
            )
            const sellerId = (results as unknown as Array<{ seller_id: number | null }>)[0]?.seller_id
            await tx.executeAsync(`DELETE FROM payments WHERE id = ?`, [id])
            // Removing a payment shifts every later payment one purchase
            // earlier under FIFO — rebuild the links so the correct purchases
            // stay locked.
            if (sellerId != null) {
                await reallocateSellerPayments(tx, sellerId)
            }
        })
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to delete payment', error)
    }
}
