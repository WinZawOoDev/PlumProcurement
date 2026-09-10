import { DatabaseError, initDb } from './connection'
import { runMigrations } from './migrations'

/**
 * One-time database bootstrap.
 * Creates the current schema (idempotent) and applies versioned migrations.
 * New installs get the normalized purchases/purchase_items split directly;
 * legacy installs keep their existing tables and are upgraded by migrations.
 * Memoized: repeated calls (e.g. from every service method) are no-ops.
 */
const TABLE_STATEMENTS = [
    `CREATE TABLE IF NOT EXISTS prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        price REAL NOT NULL,
        unit TEXT NOT NULL,
        category TEXT,
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
        seller_id INTEGER REFERENCES sellers(id) ON DELETE RESTRICT,
        total REAL NOT NULL,
        purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS purchase_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
        price_id INTEGER REFERENCES prices(id) ON DELETE RESTRICT,
        category TEXT NOT NULL,
        unit TEXT NOT NULL,
        unit_price REAL NOT NULL,
        quantity INTEGER NOT NULL CHECK(quantity > 0),
        line_total REAL NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id INTEGER NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
        purchase_id INTEGER REFERENCES purchases(id) ON DELETE SET NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        method TEXT,
        note TEXT,
        paid_at TEXT DEFAULT CURRENT_TIMESTAMP,
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
