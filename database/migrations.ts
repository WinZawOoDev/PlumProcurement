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
    // NOTE on editing migrations: entries that already ran on an install are
    // never re-run (gated by PRAGMA user_version), so touching a migration body
    // only affects installs that have not applied it yet. v9 below is edited
    // for exactly that reason: on installs with blank price rows it always
    // failed *before* the version bump, so it was never recorded there; on
    // installs where it succeeded it will never run again.
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
                // foreign_keys is toggled outside the transaction (SQLite makes
                // the pragma a no-op inside one); the rebuild itself is atomic,
                // so a failure can never leave purchase_items without its
                // purchases table.
                await db.executeAsync(`PRAGMA foreign_keys = OFF`)
                try {
                    await db.transaction(async (tx) => {
                        await tx.executeAsync(`CREATE TABLE purchases_new (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            seller_id INTEGER REFERENCES sellers(id) ON DELETE RESTRICT,
                            total REAL NOT NULL,
                            purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,
                            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                        )`)
                        await tx.executeAsync(
                            `INSERT INTO purchases_new (id, seller_id, total, purchased_at, created_at, updated_at)
                             SELECT id, seller_id, total, created_at, created_at, created_at FROM purchases`
                        )
                        // Each legacy row becomes one line item.
                        await tx.executeAsync(
                            `INSERT INTO purchase_items (purchase_id, price_id, category, unit, unit_price, quantity, line_total)
                             SELECT id, price_id, category, unit, unit_price, quantity, total FROM purchases`
                        )
                        await tx.executeAsync(`DROP TABLE purchases`)
                        await tx.executeAsync(`ALTER TABLE purchases_new RENAME TO purchases`)
                    })
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
    {
        version: 5,
        up: async () => {
            const db = initDb()
            // `payments.purchase_id` is the hot column for the purchase-lock
            // flag and FIFO lookups but was never indexed.
            await db.executeAsync(
                `CREATE INDEX IF NOT EXISTS idx_payments_purchase_id ON payments(purchase_id)`
            )
        },
    },
    {
        version: 6,
        up: async () => {
            const db = initDb()
            // A price is unique per (category, unit, price). Collapse any
            // pre-existing duplicates first, re-pointing their purchase line
            // items to the kept (lowest id) row, so the unique index can be
            // created. Runs as one transaction so the dedupe + index are atomic.
            await db.transaction(async (tx) => {
                await tx.executeAsync(`DROP TABLE IF EXISTS price_dupes`)
                await tx.executeAsync(`CREATE TEMP TABLE price_dupes AS
                    SELECT p.id AS dup_id, k.keep_id AS keep_id
                    FROM prices p
                    JOIN (
                        SELECT category, unit, price, MIN(id) AS keep_id
                        FROM prices
                        GROUP BY category, unit, price
                        HAVING COUNT(*) > 1
                    ) k ON k.category = p.category AND k.unit = p.unit AND k.price = p.price
                    WHERE p.id <> k.keep_id`)
                await tx.executeAsync(`UPDATE purchase_items
                    SET price_id = (SELECT keep_id FROM price_dupes WHERE dup_id = purchase_items.price_id)
                    WHERE price_id IN (SELECT dup_id FROM price_dupes)`)
                await tx.executeAsync(`DELETE FROM prices WHERE id IN (SELECT dup_id FROM price_dupes)`)
                await tx.executeAsync(`DROP TABLE IF EXISTS price_dupes`)
                await tx.executeAsync(
                    `CREATE UNIQUE INDEX IF NOT EXISTS idx_prices_category_unit_price
                     ON prices(category, unit, price)`
                )
            })
        },
    },
    {
        version: 7,
        up: async () => {
            const db = initDb()
            // Re-assert the prices unique index for installs whose v6 run did
            // not leave a working one behind (older/partial migration). Any
            // index sharing the name is dropped first so a non-unique one can
            // never shadow the constraint, then duplicates are collapsed and the
            // unique index is recreated. Runs as one atomic transaction.
            await db.transaction(async (tx) => {
                await tx.executeAsync(`DROP INDEX IF EXISTS idx_prices_category_unit_price`)
                await tx.executeAsync(`DROP TABLE IF EXISTS price_dupes`)
                await tx.executeAsync(`CREATE TEMP TABLE price_dupes AS
                    SELECT p.id AS dup_id, k.keep_id AS keep_id
                    FROM prices p
                    JOIN (
                        SELECT category, unit, price, MIN(id) AS keep_id
                        FROM prices
                        GROUP BY category, unit, price
                        HAVING COUNT(*) > 1
                    ) k ON k.category IS p.category AND k.unit IS p.unit AND k.price IS p.price
                    WHERE p.id <> k.keep_id`)
                await tx.executeAsync(`UPDATE purchase_items
                    SET price_id = (SELECT keep_id FROM price_dupes WHERE dup_id = purchase_items.price_id)
                    WHERE price_id IN (SELECT dup_id FROM price_dupes)`)
                await tx.executeAsync(`DELETE FROM prices WHERE id IN (SELECT dup_id FROM price_dupes)`)
                await tx.executeAsync(`DROP TABLE IF EXISTS price_dupes`)
                await tx.executeAsync(
                    `CREATE UNIQUE INDEX idx_prices_category_unit_price
                     ON prices(category, unit, price)`
                )
            })
        },
    },
    {
        version: 8,
        up: async () => {
            const db = initDb()
            // The prices compound key is now (category, unit): a category+unit
            // has exactly one price row, the amount being a mutable value rather
            // than part of the key. Collapse any pre-existing duplicates by
            // keeping the most recent row and re-pointing their purchase line
            // items (each item keeps its own unit_price snapshot), then swap the
            // old (category, unit, price) unique index for the compound one.
            // Runs as one transaction so the dedupe + index swap are atomic.
            await db.transaction(async (tx) => {
                await tx.executeAsync(`DROP INDEX IF EXISTS idx_prices_category_unit_price`)
                await tx.executeAsync(`DROP TABLE IF EXISTS price_dupes`)
                await tx.executeAsync(`CREATE TEMP TABLE price_dupes AS
                    SELECT p.id AS dup_id, k.keep_id AS keep_id
                    FROM prices p
                    JOIN (
                        SELECT category, unit, MAX(id) AS keep_id
                        FROM prices
                        GROUP BY category, unit
                        HAVING COUNT(*) > 1
                    ) k ON k.category IS p.category AND k.unit IS p.unit
                    WHERE p.id <> k.keep_id`)
                await tx.executeAsync(`UPDATE purchase_items
                    SET price_id = (SELECT keep_id FROM price_dupes WHERE dup_id = purchase_items.price_id)
                    WHERE price_id IN (SELECT dup_id FROM price_dupes)`)
                await tx.executeAsync(`DELETE FROM prices WHERE id IN (SELECT dup_id FROM price_dupes)`)
                await tx.executeAsync(`DROP TABLE IF EXISTS price_dupes`)
                await tx.executeAsync(
                    `CREATE UNIQUE INDEX idx_prices_category_unit
                     ON prices(category, unit)`
                )
            })
        },
    },
    {
        version: 9,
        up: async () => {
            const db = initDb()
            // Close the NULL bypass of the (category, unit) unique key: SQLite
            // treats NULLs as distinct, so duplicate (NULL, unit) rows were
            // allowed. Normalize NULL/blank category/unit to trimmed text,
            // drop rows that are still blank, collapse duplicates (keep newest),
            // then re-assert the unique index. Fresh installs already create
            // prices.category NOT NULL via schema.ts.
            await db.transaction(async (tx) => {
                await tx.executeAsync(`UPDATE prices SET category = TRIM(category) WHERE category IS NOT NULL`)
                await tx.executeAsync(`UPDATE prices SET unit = TRIM(unit) WHERE unit IS NOT NULL`)
                await tx.executeAsync(`UPDATE prices SET category = '' WHERE category IS NULL`)
                await tx.executeAsync(`UPDATE prices SET unit = '' WHERE unit IS NULL`)
                // purchase_items.price_id is ON DELETE RESTRICT: unlink the
                // line items first (price_id is nullable; the category/unit/unit_price
                // snapshots on the item itself are preserved) or the DELETE
                // below fails with FOREIGN KEY constraint failed on installs
                // that still reference a blank row.
                await tx.executeAsync(`UPDATE purchase_items
                    SET price_id = NULL
                    WHERE price_id IN (SELECT id FROM prices WHERE category = '' OR unit = '')`)
                await tx.executeAsync(`DELETE FROM prices WHERE category = '' OR unit = ''`)
                await tx.executeAsync(`DROP TABLE IF EXISTS price_dupes`)
                await tx.executeAsync(`CREATE TEMP TABLE price_dupes AS
                    SELECT p.id AS dup_id, k.keep_id AS keep_id
                    FROM prices p
                    JOIN (
                        SELECT category, unit, MAX(id) AS keep_id
                        FROM prices
                        GROUP BY category, unit
                        HAVING COUNT(*) > 1
                    ) k ON k.category IS p.category AND k.unit IS p.unit
                    WHERE p.id <> k.keep_id`)
                await tx.executeAsync(`UPDATE purchase_items
                    SET price_id = (SELECT keep_id FROM price_dupes WHERE dup_id = purchase_items.price_id)
                    WHERE price_id IN (SELECT dup_id FROM price_dupes)`)
                await tx.executeAsync(`DELETE FROM prices WHERE id IN (SELECT dup_id FROM price_dupes)`)
                await tx.executeAsync(`DROP TABLE IF EXISTS price_dupes`)
                await tx.executeAsync(`DROP INDEX IF EXISTS idx_prices_category_unit`)
                await tx.executeAsync(
                    `CREATE UNIQUE INDEX idx_prices_category_unit
                     ON prices(category, unit)`
                )
            })
        },
    },
    {
        version: 10,
        up: async () => {
            const db = initDb()
            // Track whether a payment -> purchase link was chosen explicitly by
            // the user ('explicit') or derived from the FIFO rule ('auto').
            // Pre-existing links default to 'explicit' so the reallocator can
            // never silently move them (which would change purchase locks);
            // only 'auto' rows are re-ranked on delete. Guarded ADD COLUMN, so
            // re-running is a no-op. Fresh installs get the column from schema.ts.
            const { results } = await db.executeAsync(`PRAGMA table_info(payments)`)
            const columns = (results as unknown as Array<{ name: string }>).map((col) => col.name)
            if (!columns.includes('link_source')) {
                await db.executeAsync(
                    `ALTER TABLE payments ADD COLUMN link_source TEXT NOT NULL DEFAULT 'explicit'`
                )
            }
        },
    },
    {
        version: 11,
        up: async () => {
            const db = initDb()
            // Store money as integer minor units (x100, see database/money.ts)
            // so sums and balance comparisons are exact. Guarded by a marker
            // row written in the same transaction, so a crash between this
            // migration and the user_version bump can never double-convert.
            const { results } = await db.executeAsync(
                `SELECT value FROM app_settings WHERE key = ?`,
                ['money_minor_units_v11']
            )
            const done = (results as unknown as Array<{ value: string }>)[0]?.value === '1'
            if (done) return
            await db.transaction(async (tx) => {
                await tx.executeAsync(`UPDATE prices SET price = ROUND(price * 100)`)
                await tx.executeAsync(`UPDATE purchases SET total = ROUND(total * 100)`)
                await tx.executeAsync(
                    `UPDATE purchase_items SET unit_price = ROUND(unit_price * 100), line_total = ROUND(line_total * 100)`
                )
                await tx.executeAsync(`UPDATE payments SET amount = ROUND(amount * 100)`)
                await tx.executeAsync(
                    `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`,
                    ['money_minor_units_v11', '1']
                )
            })
        },
    },
    {
        version: 12,
        up: async () => {
            const db = initDb()
            // Drop indexes nothing queries (lists order by id; created_at is
            // only ever matched with a leading-wildcard LIKE) and the
            // write-only purchases.purchased_at column (CSV and the UI use
            // created_at). The DROP COLUMN is best-effort: if the bundled
            // SQLite predates ALTER TABLE DROP COLUMN support, the unused
            // column simply stays — it is never read.
            await db.executeAsync(`DROP INDEX IF EXISTS idx_purchases_created_at`)
            await db.executeAsync(`DROP INDEX IF EXISTS idx_payments_paid_at`)
            const { results } = await db.executeAsync(`PRAGMA table_info(purchases)`)
            const columns = (results as unknown as Array<{ name: string }>).map((col) => col.name)
            if (columns.includes('purchased_at')) {
                try {
                    await db.executeAsync(`ALTER TABLE purchases DROP COLUMN purchased_at`)
                } catch (error) {
                    console.warn('v12: could not drop purchases.purchased_at, leaving it unused', error)
                }
            }
        },
    },
]

/** Highest migration version. Test helpers must use this, never a hardcoded copy. */
export const LATEST_VERSION: number = MIGRATIONS.reduce((max, m) => Math.max(max, m.version), 0)

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
