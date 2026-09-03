import { DatabaseError, initDb } from './connection'
import { runMigrations } from './migrations'

/**
 * One-time database bootstrap.
 * Creates all tables (idempotent) and applies versioned migrations.
 * Memoized: repeated calls (e.g. from every service method) are no-ops.
 */
const TABLE_STATEMENTS = [
    `CREATE TABLE IF NOT EXISTS prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        price REAL NOT NULL,
        unit TEXT NOT NULL,
        category TEXT,
        is_available BOOLEAN,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS sellers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        price_id INTEGER NOT NULL REFERENCES prices(id) ON DELETE RESTRICT,
        seller_id INTEGER REFERENCES sellers(id) ON DELETE RESTRICT,
        category TEXT NOT NULL,
        unit TEXT NOT NULL,
        unit_price REAL NOT NULL,
        quantity INTEGER NOT NULL CHECK(quantity > 0),
        total REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )`,
]

let initPromise: Promise<void> | null = null

export function initializeSchema(): Promise<void> {
    if (initPromise) return initPromise
    initPromise = bootstrapSchema().catch((error) => {
        initPromise = null
        throw error
    })
    return initPromise
}

async function bootstrapSchema(): Promise<void> {
    try {
        const db = initDb()
        // Foreign keys are per-connection in SQLite — must be enabled for the
        // singleton handle. New installs get REFERENCES clauses above; legacy
        // installs keep the app-level COUNT guards in deletePrice/deleteSeller.
        await db.executeAsync(`PRAGMA foreign_keys = ON`)
        for (const statement of TABLE_STATEMENTS) {
            await db.executeAsync(statement)
        }
        await runMigrations()
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to initialize database schema', error)
    }
}

export function __resetSchemaForTests(): void {
    initPromise = null
}
