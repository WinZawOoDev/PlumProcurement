/**
 * Minimal in-memory fake of `react-native-nitro-sqlite` that actually
 * persists `prices` rows. Bootstrap reports `user_version` 8 so the
 * migration runner is skipped; all other DDL is a no-op.
 */

type PriceRow = {
    id: number
    price: number
    unit: string | null
    category: string | null
    created_at: string
    updated_at: string
}

let prices: PriceRow[] = []
let nextId = 1

export function __resetInMemoryDb(): void {
    prices = []
    nextId = 1
}

type QueryResult = { results?: unknown[]; insertId?: number }

function runQuery(query: string, params: unknown[] = []): QueryResult {
    const q = String(query).replace(/\s+/g, ' ').trim()
    if (/^PRAGMA user_version$/i.test(q)) return { results: [{ user_version: 8 }] }
    if (/^PRAGMA/i.test(q)) return { results: [] }
    if (/^CREATE TABLE/i.test(q)) return { results: [] }
    if (/^CREATE (UNIQUE )?INDEX/i.test(q)) return { results: [] }
    if (/^SELECT id FROM prices WHERE category IS \? AND unit IS \? LIMIT 1$/i.test(q)) {
        const [category, unit] = params as Array<string | null>
        return {
            // `IS` matches NULLs, like SQLite.
            results: prices
                .filter((p) => p.category === category && p.unit === unit)
                .map((p) => ({ id: p.id })),
        }
    }
    if (/^SELECT \* FROM prices ORDER BY id DESC$/i.test(q)) {
        return { results: [...prices].sort((a, b) => b.id - a.id) }
    }
    if (/^INSERT INTO prices/i.test(q)) {
        const [price, unit, category] = params as [number, string, string]
        const row: PriceRow = {
            id: nextId++,
            price,
            unit,
            category,
            created_at: '',
            updated_at: '',
        }
        prices.push(row)
        return { insertId: row.id }
    }
    return { results: [] }
}

type TxHandle = {
    executeAsync: (query: string, params?: unknown[]) => Promise<QueryResult>
    commit: () => Record<string, never>
    rollback: () => Record<string, never>
}

const txHandle: TxHandle = {
    executeAsync: (qq, pp) => Promise.resolve(runQuery(qq, pp)),
    commit: () => ({}),
    rollback: () => ({}),
}

export function open() {
    return {
        executeAsync: (qq: string, pp?: unknown[]) => Promise.resolve(runQuery(qq, pp)),
        transaction: async (callback: (tx: TxHandle) => Promise<unknown>) => callback(txHandle),
        close: () => {},
    }
}
