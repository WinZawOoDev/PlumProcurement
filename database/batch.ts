import type { SQLiteValue } from 'react-native-nitro-sqlite'
import type { DbExecutor } from './connection'

/**
 * Conservative SQLite bound-parameter budget. Older SQLite builds cap a
 * statement at 999 host parameters, so chunk sizing stays well under it.
 */
const MAX_PARAMS = 900

/** Splits `rows` into consecutive chunks of at most `size` entries. */
export function chunkRows<T>(rows: T[], size: number): T[][] {
    if (size <= 0 || rows.length <= size) return [rows]
    const chunks: T[][] = []
    for (let i = 0; i < rows.length; i += size) {
        chunks.push(rows.slice(i, i + size))
    }
    return chunks
}

/**
 * Inserts many rows using one multi-row `INSERT ... VALUES (..), (..)` per
 * chunk instead of one statement per row. This removes the N+1 insert loop
 * (one round trip per line item) that dominates large purchase writes; the
 * work becomes O(rows / chunkSize) statements, typically a single statement.
 *
 * Must be called with a `DbExecutor` (raw connection or transaction handle).
 */
export async function insertMany(
    db: DbExecutor,
    table: string,
    columns: string[],
    rows: SQLiteValue[][]
): Promise<void> {
    if (rows.length === 0) return

    const columnList = columns.join(', ')
    const rowPlaceholder = `(${columns.map(() => '?').join(', ')})`
    const perStatement = Math.max(1, Math.floor(MAX_PARAMS / columns.length))

    for (const group of chunkRows(rows, perStatement)) {
        const values = group.map(() => rowPlaceholder).join(', ')
        await db.executeAsync(
            `INSERT INTO ${table} (${columnList}) VALUES ${values}`,
            group.flat()
        )
    }
}
