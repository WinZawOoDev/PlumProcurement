import { tMessage } from '../i18n'
import type { ISeller, ISellerPaymentStat, ISellerWithStats } from '../types/database'
import { DatabaseError, initDb } from './connection'
import { fromMinor } from './money'
import { initializeSchema } from './schema'
import { clampPageLimit, escapeLikePattern, isForeignKeyViolation, SELLER_BALANCE_SELECT } from './sql'

export async function initializeSellers(): Promise<void> {
    await initializeSchema()
}

export async function fetchSellers(): Promise<ISeller[]> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(`
            SELECT * FROM sellers ORDER BY name ASC
        `);
        return results as unknown as ISeller[]
    } catch (error) {
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

export async function fetchSellerById(id: number): Promise<ISeller | null> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(`
            SELECT * FROM sellers WHERE id = ? LIMIT 1
        `, [id]);
        const rows = results as unknown as ISeller[]
        return rows[0] ?? null
    } catch (error) {
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

/** Keyset cursor over sellers ordered by (name, id). */
export interface SellersCursor {
    name: string
    id: number
}

export interface SellersPage {
    items: ISellerWithStats[]
    /** last row of this page; null when there are no more rows */
    nextCursor: SellersCursor | null
}

/**
 * Search predicate shared by the page + count queries. Matches, case
 * insensitively, the seller name or phone.
 */
function buildSellerFilters(query?: string): { clauses: string[]; params: string[] } {
    const clauses: string[] = []
    const params: string[] = []
    const q = query?.trim()
    if (q) {
        const like = `%${escapeLikePattern(q)}%`
        clauses.push(
            `(s.name LIKE ? ESCAPE '\\' COLLATE NOCASE OR s.phone LIKE ? ESCAPE '\\' COLLATE NOCASE)`
        )
        params.push(like, like)
    }
    return { clauses, params }
}

function toMajorSellerWithStats(row: ISellerWithStats): ISellerWithStats {
    return {
        ...row,
        total_spent: fromMinor(row.total_spent),
        balance: fromMinor(row.balance),
    }
}

/**
 * Keyset pagination over sellers (name ASC, id ASC) with their purchase
 * aggregate and outstanding balance rolled in, so the list screen no longer
 * loads every seller + every stat + every payment summary.
 */
export async function fetchSellersPage(options: {
    limit: number
    cursor?: SellersCursor
    query?: string
}): Promise<SellersPage> {
    let db;
    try {
        db = initDb()
        const { cursor, query } = options
        const limit = clampPageLimit(options.limit)
        const filters = buildSellerFilters(query)
        const where = [...filters.clauses]
        const params: Array<string | number> = [...filters.params]
        if (cursor) {
            // Composite cursor keeps the name ordering stable across pages.
            where.push('(s.name > ? OR (s.name = ? AND s.id > ?))')
            params.push(cursor.name, cursor.name, cursor.id)
        }
        const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''
        const { results } = await db.executeAsync(
            `
            SELECT s.*,
                   COALESCE(pc.purchase_count, 0) AS purchase_count,
                   COALESCE(pc.total_spent, 0) AS total_spent,
                   COALESCE(pc.total_spent, 0) - COALESCE(pd.total_paid, 0) AS balance
            FROM sellers s
            LEFT JOIN (
                SELECT seller_id, COUNT(*) AS purchase_count, SUM(total) AS total_spent
                FROM purchases WHERE seller_id IS NOT NULL GROUP BY seller_id
            ) pc ON pc.seller_id = s.id
            LEFT JOIN (
                SELECT seller_id, SUM(amount) AS total_paid
                FROM payments GROUP BY seller_id
            ) pd ON pd.seller_id = s.id
            ${whereSql}
            ORDER BY s.name ASC, s.id ASC
            LIMIT ?
            `,
            [...params, limit + 1]
        )
        const rows = (results as unknown as ISellerWithStats[]).map(toMajorSellerWithStats)
        const hasMore = rows.length > limit
        const items = hasMore ? rows.slice(0, limit) : rows
        const last = items[items.length - 1]
        return {
            items,
            nextCursor: hasMore && last ? { name: last.name, id: last.id } : null,
        }
    } catch (error) {
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

export interface SellerStatDetail {
    seller_id: number
    seller_name: string | null
    purchase_count: number
    total_owed: number
    total_paid: number
    balance: number
}

/**
 * Purchase aggregate + balance for a single seller, so detail screens do not
 * have to load every seller's stats to read one seller's numbers.
 */
export async function fetchSellerStatById(sellerId: number): Promise<SellerStatDetail | null> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(
            `SELECT s.id AS seller_id, s.name AS seller_name,
                    COALESCE(pc.purchase_count, 0) AS purchase_count,
                    COALESCE(pc.total_owed, 0) AS total_owed,
                    COALESCE(pay.total_paid, 0) AS total_paid
             FROM sellers s
             LEFT JOIN (
                 SELECT seller_id, COUNT(*) AS purchase_count, SUM(total) AS total_owed
                 FROM purchases WHERE seller_id IS NOT NULL GROUP BY seller_id
             ) pc ON pc.seller_id = s.id
             LEFT JOIN (
                 SELECT seller_id, SUM(amount) AS total_paid
                 FROM payments GROUP BY seller_id
             ) pay ON pay.seller_id = s.id
             WHERE s.id = ?`,
            [sellerId]
        )
        const row = (results as unknown as Array<Omit<SellerStatDetail, 'balance'>>)[0]
        if (!row) return null
        const total_owed = fromMinor(row.total_owed)
        const total_paid = fromMinor(row.total_paid)
        return { ...row, total_owed, total_paid, balance: total_owed - total_paid }
    } catch (error) {
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

/** Balance summary for a single seller (owed / paid / balance, major units). */
export async function fetchSellerBalanceById(sellerId: number): Promise<ISellerPaymentStat | null> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(
            `${SELLER_BALANCE_SELECT} WHERE s.id = ?`,
            [sellerId]
        )
        const row = (results as unknown as Array<Omit<ISellerPaymentStat, 'balance'>>)[0]
        if (!row) return null
        const total_owed = fromMinor(row.total_owed)
        const total_paid = fromMinor(row.total_paid)
        return { ...row, total_owed, total_paid, balance: total_owed - total_paid }
    } catch (error) {
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

export async function countSellers(query?: string): Promise<number> {
    let db;
    try {
        db = initDb()
        const { clauses, params } = buildSellerFilters(query)
        const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''
        const { results } = await db.executeAsync(
            `SELECT COUNT(*) AS count FROM sellers s ${whereSql}`,
            params
        )
        return (results as unknown as Array<{ count: number }>)[0]?.count ?? 0
    } catch (error) {
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

export async function createSeller(sellerData: Omit<ISeller, 'id'>): Promise<number> {
    let db;
    try {
        const { name, phone, address } = sellerData;

        if (!name || !name.trim()) {
            throw new DatabaseError(tMessage('ERROR_INVALID_INPUT'))
        }

        db = initDb()
        const { insertId } = await db.executeAsync(`
            INSERT INTO sellers (name, phone, address)
            VALUES (?, ?, ?)
        `, [name.trim(), phone ?? null, address ?? null]);

        return insertId as number;
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

export async function updateSeller(id: number, sellerData: Partial<Omit<ISeller, 'id'>>): Promise<void> {
    let db;
    try {
        const updates: string[] = []
        const values: any[] = []

        if (sellerData.name !== undefined) {
            if (!sellerData.name.trim()) {
                throw new DatabaseError(tMessage('ERROR_INVALID_INPUT'))
            }
            updates.push('name = ?')
            values.push(sellerData.name.trim())
        }
        if (sellerData.phone !== undefined) {
            updates.push('phone = ?')
            values.push(sellerData.phone)
        }
        if (sellerData.address !== undefined) {
            updates.push('address = ?')
            values.push(sellerData.address)
        }

        if (updates.length === 0) {
            return
        }

        updates.push('updated_at = CURRENT_TIMESTAMP')
        values.push(id)

        db = initDb()
        const updateResult = await db.executeAsync(`
            UPDATE sellers
            SET ${updates.join(', ')}
            WHERE id = ?
        `, values)
        if (updateResult.rowsAffected === 0) {
            throw new DatabaseError(tMessage('ERROR_NOT_FOUND'))
        }
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

export async function deleteSeller(id: number): Promise<void> {
    let db;
    try {
        db = initDb()
        // Guard + delete in a queued transaction so a concurrent purchase
        // referencing this seller cannot slip in between the count check and
        // the delete.
        await db.transaction(async (tx) => {
            const { results } = await tx.executeAsync(
                `SELECT COUNT(*) AS count FROM purchases WHERE seller_id = ?`,
                [id]
            );
            const referencedCount =
                (results as unknown as Array<{ count: number }>)[0]?.count ?? 0;
            if (referencedCount > 0) {
                throw new DatabaseError(tMessage('ERROR_SELLER_IN_USE'))
            }
            const { results: paymentResults } = await tx.executeAsync(
                `SELECT COUNT(*) AS count FROM payments WHERE seller_id = ?`,
                [id]
            );
            const paymentCount =
                (paymentResults as unknown as Array<{ count: number }>)[0]?.count ?? 0;
            if (paymentCount > 0) {
                throw new DatabaseError(tMessage('ERROR_SELLER_HAS_PAYMENTS'))
            }
            const deleteResult = await tx.executeAsync(`DELETE FROM sellers WHERE id = ?`, [id])
            if (deleteResult.rowsAffected === 0) {
                throw new DatabaseError(tMessage('ERROR_NOT_FOUND'))
            }
        })
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        if (isForeignKeyViolation(error)) {
            throw new DatabaseError(tMessage('ERROR_SELLER_IN_USE'), error)
        }
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}
