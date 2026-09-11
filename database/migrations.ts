import { DatabaseError, initDb } from './connection'

/**
 * Versioned schema migrations.
 * Each migration runs once; applied version is tracked via PRAGMA user_version.
 * Never edit an applied migration — append a new one instead.
 */
type Migration = {
    version: number
    up: () => Promise<void>
}

const MIGRATIONS: Migration[] = [
    {
        version: 1,
        up: async () => {
            const db = initDb()
            // purchases.seller_id for installs that predate the column
            const { results } = await db.executeAsync(`PRAGMA table_info(purchases)`)
            const columns = (results as unknown as Array<{ name: string }>).map((col) => col.name)
            if (!columns.includes('seller_id')) {
                await db.executeAsync(`ALTER TABLE purchases ADD COLUMN seller_id INTEGER`)
            }
            // price_id only exists on pre-normalization flat tables; on a fresh
            // install purchases is already split, so indexing it would fail with
            // "no such column". v3 indexes purchase_items(price_id) instead.
            if (columns.includes('price_id')) {
                await db.executeAsync(`CREATE INDEX IF NOT EXISTS idx_purchases_price_id ON purchases(price_id)`)
            }
            await db.executeAsync(`CREATE INDEX IF NOT EXISTS idx_purchases_seller_id ON purchases(seller_id)`)
            await db.executeAsync(`CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at)`)
            await db.executeAsync(`CREATE INDEX IF NOT EXISTS idx_sellers_name ON sellers(name)`)
        },
    },
    {
        version: 2,
        up: async () => {
            const db = initDb()
            // sellers.address for installs that predate the column
            const { results } = await db.executeAsync(`PRAGMA table_info(sellers)`)
            const columns = (results as unknown as Array<{ name: string }>).map((col) => col.name)
            if (!columns.includes('address')) {
                await db.executeAsync(`ALTER TABLE sellers ADD COLUMN address TEXT`)
            }
        },
    },
    {
        version: 3,
        up: async () => {
            const db = initDb()
            // Normalize purchases: split the flattened rows into a purchases
            // header + purchase_items lines, and introduce the payments table.
            const { results: infoResults } = await db.executeAsync(`PRAGMA table_info(purchases)`)
            const columns = (infoResults as unknown as Array<{ name: string }>).map((col) => col.name)

            const legacyFlat = columns.includes('price_id') && columns.includes('quantity')

            await db.executeAsync(`CREATE TABLE IF NOT EXISTS purchase_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
                price_id INTEGER REFERENCES prices(id) ON DELETE RESTRICT,
                category TEXT NOT NULL,
                unit TEXT NOT NULL,
                unit_price REAL NOT NULL,
                quantity INTEGER NOT NULL CHECK(quantity > 0),
                line_total REAL NOT NULL
            )`)
            await db.executeAsync(`CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                seller_id INTEGER NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
                purchase_id INTEGER REFERENCES purchases(id) ON DELETE SET NULL,
                amount REAL NOT NULL CHECK(amount > 0),
                method TEXT,
                note TEXT,
                paid_at TEXT DEFAULT CURRENT_TIMESTAMP,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )`)

            if (legacyFlat) {
                // Recreate purchases with the normalized header shape while
                // preserving ids, totals and timestamps for existing history.
                await db.executeAsync(`PRAGMA foreign_keys = OFF`)
                try {
                    await db.executeAsync(`CREATE TABLE purchases_new (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        seller_id INTEGER REFERENCES sellers(id) ON DELETE RESTRICT,
                        total REAL NOT NULL,
                        purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )`)
                    await db.executeAsync(
                        `INSERT INTO purchases_new (id, seller_id, total, purchased_at, created_at, updated_at)
                         SELECT id, seller_id, total, created_at, created_at, created_at FROM purchases`
                    )
                    // Each legacy row becomes one line item.
                    await db.executeAsync(
                        `INSERT INTO purchase_items (purchase_id, price_id, category, unit, unit_price, quantity, line_total)
                         SELECT id, price_id, category, unit, unit_price, quantity, total FROM purchases`
                    )
                    await db.executeAsync(`DROP TABLE purchases`)
                    await db.executeAsync(`ALTER TABLE purchases_new RENAME TO purchases`)
                } finally {
                    await db.executeAsync(`PRAGMA foreign_keys = ON`)
                }
            }

            await db.executeAsync(`CREATE INDEX IF NOT EXISTS idx_purchases_seller_id ON purchases(seller_id)`)
            await db.executeAsync(`CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at)`)
            await db.executeAsync(`CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id)`)
            await db.executeAsync(`CREATE INDEX IF NOT EXISTS idx_purchase_items_price_id ON purchase_items(price_id)`)
            await db.executeAsync(`CREATE INDEX IF NOT EXISTS idx_payments_seller_id ON payments(seller_id)`)
            await db.executeAsync(`CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at)`)
        },
    },
    {
        version: 4,
        up: async () => {
            const db = initDb()
            // Backfill explicit payment -> purchase links for payments recorded
            // before linking existed. Each unlinked payment is paired with the
            // seller's oldest purchase that has no payment yet (FIFO), so the
            // paid purchases become the locked ones.
            const { results } = await db.executeAsync(
                `SELECT DISTINCT seller_id FROM payments WHERE purchase_id IS NULL AND seller_id IS NOT NULL`
            )
            const sellers = results as unknown as Array<{ seller_id: number }>

            for (const { seller_id } of sellers) {
                const { results: purchaseRows } = await db.executeAsync(
                    `SELECT p.id FROM purchases p
                     WHERE p.seller_id = ?
                       AND NOT EXISTS (SELECT 1 FROM payments pay WHERE pay.purchase_id = p.id)
                     ORDER BY p.id ASC`,
                    [seller_id]
                )
                const { results: paymentRows } = await db.executeAsync(
                    `SELECT id FROM payments WHERE seller_id = ? AND purchase_id IS NULL ORDER BY id ASC`,
                    [seller_id]
                )
                const purchaseIds = (purchaseRows as unknown as Array<{ id: number }>).map((row) => row.id)
                const paymentIds = (paymentRows as unknown as Array<{ id: number }>).map((row) => row.id)

                const pairs = Math.min(purchaseIds.length, paymentIds.length)
                for (let i = 0; i < pairs; i++) {
                    await db.executeAsync(
                        `UPDATE payments SET purchase_id = ? WHERE id = ?`,
                        [purchaseIds[i], paymentIds[i]]
                    )
                }
            }
        },
    },
]

let migrationsPromise: Promise<void> | null = null

export async function runMigrations(): Promise<void> {
    if (migrationsPromise) return migrationsPromise
    migrationsPromise = applyPendingMigrations().catch((error) => {
        migrationsPromise = null
        throw error
    })
    return migrationsPromise
}

async function applyPendingMigrations(): Promise<void> {
    const db = initDb()
    let currentVersion = 0
    try {
        const { results } = await db.executeAsync(`PRAGMA user_version`)
        currentVersion = (results as unknown as Array<{ user_version: number }>)[0]?.user_version ?? 0
    } catch (error) {
        throw new DatabaseError('Failed to read schema version', error)
    }

    for (const migration of MIGRATIONS) {
        if (migration.version <= currentVersion) continue
        try {
            await migration.up()
            await db.executeAsync(`PRAGMA user_version = ${migration.version}`)
        } catch (error) {
            throw new DatabaseError(`Migration to version ${migration.version} failed`, error)
        }
    }
}

export function __resetMigrationsForTests(): void {
    migrationsPromise = null
}
