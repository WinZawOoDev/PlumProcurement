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
            await db.executeAsync(`CREATE INDEX IF NOT EXISTS idx_purchases_price_id ON purchases(price_id)`)
            await db.executeAsync(`CREATE INDEX IF NOT EXISTS idx_purchases_seller_id ON purchases(seller_id)`)
            await db.executeAsync(`CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at)`)
            await db.executeAsync(`CREATE INDEX IF NOT EXISTS idx_sellers_name ON sellers(name)`)
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
