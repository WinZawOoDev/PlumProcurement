import type { DbExecutor } from './connection'

/**
 * Shared SQL helpers for the database layer. Logic that was previously
 * copy-pasted across prices/purchases/payments/sellers lives here so the
 * guarded rules (LIKE escaping, FK detection, seller existence, owed/paid
 * math) can never drift apart.
 */

/**
 * Escape LIKE wildcards so a search for `100%` or `a_b` matches literally.
 * Backslash is the ESCAPE character used in the queries.
 */
export function escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, (char) => `\\${char}`)
}

/** True when the error text reports a SQLite foreign-key violation. */
export function isForeignKeyViolation(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error ?? '')
    return /FOREIGN KEY constraint failed/i.test(message)
}

/** True when the error text reports a SQLite unique-constraint violation. */
export function isUniqueViolation(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error ?? '')
    return /UNIQUE constraint failed/i.test(message)
}

/** Throws `notFoundError` when the seller id references no existing seller. */
export async function assertSellerExists(
    db: DbExecutor,
    sellerId: number,
    notFoundError: Error
): Promise<void> {
    const { results } = await db.executeAsync(
        `SELECT 1 AS ok FROM sellers WHERE id = ? LIMIT 1`,
        [sellerId]
    )
    if ((results as unknown as unknown[]).length === 0) {
        throw notFoundError
    }
}

export interface OwedAndPaid {
    /** Sum of purchase totals, integer minor units (see database/money.ts). */
    owed: number
    /** Sum of payment amounts, integer minor units. */
    paid: number
}

/**
 * Total owed (sum of purchase totals) and total paid (sum of payments) for a
 * seller. Both are integer minor units, so balance arithmetic is exact and
 * needs no epsilon. `excludePaymentId` removes one payment from the paid sum
 * (used when validating an edit to that payment's own amount).
 */
export async function fetchOwedAndPaid(
    db: DbExecutor,
    sellerId: number,
    excludePaymentId?: number
): Promise<OwedAndPaid> {
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
 * Clamps a page size to a sane range. Unbounded limits can exceed SQLite's
 * host-parameter budget in `IN (...)` queries; non-positive limits produce
 * empty pages that still report `hasMore`.
 */
export function clampPageLimit(limit: number, fallback = 20): number {
    if (!Number.isFinite(limit)) return fallback
    return Math.min(100, Math.max(1, Math.floor(limit)))
}

/**
 * Shared projection for seller balance reporting. The purchase/payment totals
 * are pre-aggregated in grouped subqueries and joined once, instead of running
 * two correlated subqueries for every seller row (an N+1 per result).
 */
export const SELLER_BALANCE_SELECT = `
    SELECT s.id AS seller_id, s.name AS seller_name,
        COALESCE(pc.total_owed, 0) AS total_owed,
        COALESCE(pay.total_paid, 0) AS total_paid
    FROM sellers s
    LEFT JOIN (
        SELECT seller_id, SUM(total) AS total_owed
        FROM purchases GROUP BY seller_id
    ) pc ON pc.seller_id = s.id
    LEFT JOIN (
        SELECT seller_id, SUM(amount) AS total_paid
        FROM payments GROUP BY seller_id
    ) pay ON pay.seller_id = s.id
`
