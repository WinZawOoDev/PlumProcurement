import { tMessage } from '../i18n'
import type { IPayment, ISellerPaymentStat } from '../types/database'
import { DatabaseError, DbExecutor, initDb } from './connection'
import { fromMinor, toMinor } from './money'
import { initializeSchema } from './schema'
import {
    assertSellerExists,
    clampPageLimit,
    fetchOwedAndPaid,
    SELLER_BALANCE_SELECT,
} from './sql'

export async function initializePayments(): Promise<void> {
    await initializeSchema()
}

function toMajorPayment(row: IPayment): IPayment {
    return { ...row, amount: fromMinor(row.amount) }
}

/**
 * Rebuilds a seller's AUTO payment -> purchase links using the canonical FIFO
 * rule (oldest auto payment settles the oldest unsettled purchase; payments
 * beyond the purchase count are left unlinked). Explicit user-chosen links are
 * never touched, and explicitly held purchases are skipped in the ranking.
 * Must be called inside a transaction whenever a payment is removed, otherwise
 * the deleted payment's purchase stays linked — leaving the wrong purchase
 * locked against edit/delete.
 *
 * Each payment is mapped by rank: the Nth auto payment (by id) takes the Nth
 * purchase (by id) among purchases not held by an explicit link. The ranking
 * is expressed with COUNT comparisons because SQLite cannot reference the
 * outer updated row inside a LIMIT/OFFSET expression.
 */
async function reallocateSellerPayments(db: DbExecutor, sellerId: number): Promise<void> {
    await db.executeAsync(
        `UPDATE payments
         SET purchase_id = (
             SELECT pur.id
             FROM purchases pur
             WHERE pur.seller_id = payments.seller_id
               AND NOT EXISTS (
                   SELECT 1 FROM payments held
                   WHERE held.purchase_id = pur.id AND held.link_source = 'explicit'
               )
               AND (
                   SELECT COUNT(*)
                   FROM purchases older
                   WHERE older.seller_id = pur.seller_id
                     AND older.id < pur.id
                     AND NOT EXISTS (
                         SELECT 1 FROM payments held2
                         WHERE held2.purchase_id = older.id AND held2.link_source = 'explicit'
                     )
               ) = (
                   SELECT COUNT(*)
                   FROM payments earlier
                   WHERE earlier.seller_id = payments.seller_id
                     AND earlier.link_source = 'auto'
                     AND earlier.id < payments.id
               )
         )
         WHERE seller_id = ? AND link_source = 'auto'`,
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
        const { sellerId, cursor } = options
        const limit = clampPageLimit(options.limit)
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
        const rows = (results as unknown as IPayment[]).map(toMajorPayment)
        const hasMore = rows.length > limit
        const items = hasMore ? rows.slice(0, limit) : rows
        const last = items[items.length - 1]
        return { items, nextCursor: hasMore && last ? last.id : null }
    } catch (error) {
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

/** Loads the most recent payments for one seller in a single bounded page. */
export async function fetchRecentPaymentsBySeller(sellerId: number, limit = 3): Promise<IPayment[]> {
    const { items } = await fetchPaymentsPage({ sellerId, limit })
    return items
}

function toMajorStat(row: Omit<ISellerPaymentStat, 'balance'>): ISellerPaymentStat {
    const total_owed = fromMinor(row.total_owed)
    const total_paid = fromMinor(row.total_paid)
    return { ...row, total_owed, total_paid, balance: total_owed - total_paid }
}

export async function fetchPaymentSummaries(): Promise<ISellerPaymentStat[]> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(`${SELLER_BALANCE_SELECT} ORDER BY s.name ASC`)
        const rows = results as unknown as Array<Omit<ISellerPaymentStat, 'balance'>>
        return rows.map(toMajorStat)
    } catch (error) {
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

export async function fetchSellerPaymentStat(sellerId: number): Promise<ISellerPaymentStat | null> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(
            `${SELLER_BALANCE_SELECT} WHERE s.id = ?`,
            [sellerId]
        )
        const rows = results as unknown as Array<Omit<ISellerPaymentStat, 'balance'>>
        if (rows.length === 0) return null
        return toMajorStat(rows[0])
    } catch (error) {
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

export async function createPayment(data: Omit<IPayment, 'id'>): Promise<number> {
    let db;
    try {
        const { seller_id, purchase_id, amount, method, note } = data
        if (!seller_id) {
            throw new DatabaseError(tMessage('ERROR_INVALID_INPUT'))
        }
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new DatabaseError(tMessage('ERROR_INVALID_AMOUNT'))
        }
        const amountMinor = toMinor(amount)

        db = initDb()
        return await db.transaction(async (tx) => {
            await assertSellerExists(tx, seller_id, new DatabaseError(tMessage('ERROR_INVALID_INPUT')))
            const { owed, paid } = await fetchOwedAndPaid(tx, seller_id)
            // Integer minor units: the comparison is exact, no epsilon needed.
            if (amountMinor > owed - paid) {
                throw new DatabaseError(tMessage('ERROR_PAYMENT_EXCEEDS_BALANCE'))
            }
            // Explicit link wins (validated); otherwise settle the seller's oldest purchase
            // that no payment has been linked to yet (FIFO).
            let linkedPurchaseId = purchase_id ?? null
            let linkSource: 'auto' | 'explicit' = 'auto'
            if (linkedPurchaseId !== null) {
                linkedPurchaseId = await assertValidLinkedPurchase(tx, seller_id, linkedPurchaseId)
                linkSource = 'explicit'
            } else {
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
                `INSERT INTO payments (seller_id, purchase_id, amount, link_source, method, note) VALUES (?, ?, ?, ?, ?, ?)`,
                [seller_id, linkedPurchaseId, amountMinor, linkSource, method ?? null, note ?? null]
            )
            return insertId as number
        })
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
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

        let amountMinor: number | undefined
        if (updates.amount !== undefined) {
            if (!Number.isFinite(updates.amount) || updates.amount <= 0) {
                throw new DatabaseError(tMessage('ERROR_INVALID_AMOUNT'))
            }
            amountMinor = toMinor(updates.amount)
            setClauses.push('amount = ?')
            values.push(amountMinor)
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
            const { results } = await tx.executeAsync(
                `SELECT seller_id, amount FROM payments WHERE id = ? LIMIT 1`,
                [id]
            )
            const existing = (results as unknown as Array<{ seller_id: number; amount: number }>)[0]
            if (!existing) {
                throw new DatabaseError(tMessage('ERROR_NOT_FOUND'))
            }
            if (amountMinor !== undefined) {
                const { owed, paid } = await fetchOwedAndPaid(tx, existing.seller_id, id)
                const balanceWithoutThis = owed - paid
                if (amountMinor > balanceWithoutThis) {
                    throw new DatabaseError(tMessage('ERROR_PAYMENT_EXCEEDS_BALANCE'))
                }
            }
            const updateResult = await tx.executeAsync(
                `UPDATE payments SET ${setClauses.join(', ')} WHERE id = ?`,
                [...values, id]
            )
            if (updateResult.rowsAffected === 0) {
                throw new DatabaseError(tMessage('ERROR_NOT_FOUND'))
            }
        })
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
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
            if ((results as unknown as unknown[]).length === 0) {
                throw new DatabaseError(tMessage('ERROR_NOT_FOUND'))
            }
            await tx.executeAsync(`DELETE FROM payments WHERE id = ?`, [id])
            // Removing a payment shifts every later *auto* payment one purchase
            // earlier under FIFO — rebuild the auto links so the correct
            // purchases stay locked. Explicit links are never touched.
            if (sellerId != null) {
                await reallocateSellerPayments(tx, sellerId)
            }
        })
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

/**
 * Validates an explicit payment -> purchase link: the purchase must exist,
 * belong to the same seller, and not already be settled by another payment.
 * Returns the validated purchase id.
 */
async function assertValidLinkedPurchase(db: DbExecutor, sellerId: number, purchaseId: number): Promise<number> {
    const { results } = await db.executeAsync(
        `SELECT id, seller_id FROM purchases WHERE id = ? LIMIT 1`,
        [purchaseId]
    )
    const row = (results as unknown as Array<{ id: number; seller_id: number | null }>)[0]
    if (!row || row.seller_id !== sellerId) {
        throw new DatabaseError(tMessage('ERROR_PAYMENT_INVALID_PURCHASE'))
    }
    const { results: linked } = await db.executeAsync(
        `SELECT 1 AS ok FROM payments WHERE purchase_id = ? LIMIT 1`,
        [purchaseId]
    )
    if ((linked as unknown as unknown[]).length > 0) {
        throw new DatabaseError(tMessage('ERROR_PAYMENT_INVALID_PURCHASE'))
    }
    return row.id
}
