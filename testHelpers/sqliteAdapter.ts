/**
 * Real-SQLite adapter for integration tests, backed by `node:sqlite`
 * (built into Node >= 22, which the repo already requires). It implements the
 * subset of the `react-native-nitro-sqlite` surface used by database/*:
 * `open() -> { executeAsync, transaction, close }`.
 *
 * Unlike testHelpers/inMemorySqlite.ts, this executes real SQL: foreign keys
 * are enforced, transactions actually roll back, and migration bodies run for
 * real. Use it for migration, FIFO-linking, money-math and rollback tests.
 * Each `open()` call creates an isolated `:memory:` database.
 *
 * Jest wiring:
 *   jest.mock('react-native-nitro-sqlite', () => require('../testHelpers/sqliteAdapter'))
 * plus the usual __resetDbForTests/__resetSchemaForTests/__resetMigrationsForTests.
 */
import { DatabaseSync, type SQLInputValue } from 'node:sqlite'

type Params = SQLInputValue[]

type RowValue = string | number | bigint | null

function isReader(query: string): boolean {
    return /^\s*(SELECT|PRAGMA|WITH|EXPLAIN|VALUES)\b/i.test(query)
}

function normalizeValue(value: unknown): string | number | null {
    if (value === null || value === undefined) return null
    if (typeof value === 'string') return value
    if (typeof value === 'number') return value
    if (typeof value === 'bigint') return Number(value)
    if (typeof value === 'boolean') return value ? 1 : 0
    return null
}

function normalizeRow(row: Record<string, RowValue | Uint8Array>): Record<string, string | number | null> {
    const out: Record<string, string | number | null> = {}
    for (const [key, value] of Object.entries(row)) {
        out[key] = normalizeValue(value)
    }
    return out
}

export function open() {
    const db = new DatabaseSync(':memory:')

    const executeAsync = async (query: string, params?: Params) => {
        const args = params ?? []
        if (isReader(query)) {
            const rows = db.prepare(query).all(...args) as Array<Record<string, RowValue | Uint8Array>>
            return { results: rows.map(normalizeRow) }
        }
        const info = db.prepare(query).run(...args)
        return {
            results: [],
            insertId: Number(info.lastInsertRowid),
            rowsAffected: Number(info.changes),
        }
    }

    const txHandle = {
        executeAsync,
        commit: () => ({}),
        rollback: () => ({}),
    }

    return {
        executeAsync,
        transaction: async <T>(callback: (tx: typeof txHandle) => Promise<T>): Promise<T> => {
            db.exec('BEGIN IMMEDIATE')
            try {
                const result = await callback(txHandle)
                db.exec('COMMIT')
                return result
            } catch (error) {
                db.exec('ROLLBACK')
                throw error
            }
        },
        close: () => {
            db.close()
        },
    }
}
