import { MESSAGES } from '../constants'
import type { IPayment, ISellerPaymentStat } from '../types/database'
import { DatabaseError, initDb } from './connection'
import { initializeSchema } from './schema'

export async function initializePayments(): Promise<void> {
    try {
        await initializeSchema()
    } catch (error) {
        throw new DatabaseError('Failed to initialize payments table', error)
    }
}

async function fetchOwedAndPaid(db: ReturnType<typeof initDb>, sellerId: number, excludePaymentId?: number): Promise<{ owed: number; paid: number }> {
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

export async function fetchPaymentsBySeller(sellerId: number, limit = 100): Promise<IPayment[]> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(
            `SELECT * FROM payments WHERE seller_id = ? ORDER BY id DESC LIMIT ?`,
            [sellerId, limit]
        )
        return results as unknown as IPayment[]
    } catch (error) {
        throw new DatabaseError('Failed to fetch payments for seller', error)
    }
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
            throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
        }
        if (!amount || amount <= 0) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_AMOUNT)
        }

        db = initDb()
        await db.executeAsync(`BEGIN IMMEDIATE`)
        try {
            const { owed, paid } = await fetchOwedAndPaid(db, seller_id)
            if (amount > owed - paid) {
                throw new DatabaseError(MESSAGES.ERROR_PAYMENT_EXCEEDS_BALANCE)
            }
            const { insertId } = await db.executeAsync(
                `INSERT INTO payments (seller_id, purchase_id, amount, method, note) VALUES (?, ?, ?, ?, ?)`,
                [seller_id, purchase_id ?? null, amount, method ?? null, note ?? null]
            )
            await db.executeAsync(`COMMIT`)
            return insertId as number
        } catch (innerError) {
            await db.executeAsync(`ROLLBACK`).catch(() => undefined)
            throw innerError
        }
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
                throw new DatabaseError(MESSAGES.ERROR_INVALID_AMOUNT)
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
        await db.executeAsync(`BEGIN IMMEDIATE`)
        try {
            if (updates.amount !== undefined) {
                const { results } = await db.executeAsync(
                    `SELECT seller_id, amount FROM payments WHERE id = ? LIMIT 1`,
                    [id]
                )
                const existing = (results as unknown as Array<{ seller_id: number; amount: number }>)[0]
                if (existing) {
                    const { owed, paid } = await fetchOwedAndPaid(db, existing.seller_id, id)
                    const balanceWithoutThis = owed - paid
                    if (updates.amount > balanceWithoutThis) {
                        throw new DatabaseError(MESSAGES.ERROR_PAYMENT_EXCEEDS_BALANCE)
                    }
                }
            }
            await db.executeAsync(
                `UPDATE payments SET ${setClauses.join(', ')} WHERE id = ?`,
                [...values, id]
            )
            await db.executeAsync(`COMMIT`)
        } catch (innerError) {
            await db.executeAsync(`ROLLBACK`).catch(() => undefined)
            throw innerError
        }
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to update payment', error)
    }
}

export async function deletePayment(id: number): Promise<void> {
    let db;
    try {
        db = initDb()
        await db.executeAsync(`DELETE FROM payments WHERE id = ?`, [id])
    } catch (error) {
        throw new DatabaseError('Failed to delete payment', error)
    }
}
