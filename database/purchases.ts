import { MESSAGES } from '../constants'
import type { IPurchase, IPurchaseWithSeller } from '../types/database'
import { DatabaseError, initDb } from './connection'

const PURCHASES_TABLE_SQL = `
            CREATE TABLE IF NOT EXISTS purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                price_id INTEGER NOT NULL,
                seller_id INTEGER,
                category TEXT NOT NULL,
                unit TEXT NOT NULL,
                unit_price REAL NOT NULL,
                quantity INTEGER NOT NULL CHECK(quantity > 0),
                total REAL NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `

async function migratePurchasesTable(db: NonNullable<ReturnType<typeof initDb>>): Promise<void> {
    const { results } = await db.executeAsync(`PRAGMA table_info(purchases)`);
    const columns = (results as unknown as Array<{ name: string }>).map((col) => col.name);
    if (!columns.includes('seller_id')) {
        await db.executeAsync(`ALTER TABLE purchases ADD COLUMN seller_id INTEGER`);
    }
}

export async function initializePurchases(): Promise<void> {
    let db;
    try {
        db = initDb()
        await db.executeAsync(PURCHASES_TABLE_SQL)
        await migratePurchasesTable(db)
    } catch (error) {
        throw new DatabaseError('Failed to initialize purchases table', error)
    }
}

export async function fetchPurchases(): Promise<IPurchaseWithSeller[]> {
    return fetchPurchasesPaginated({ limit: 100, offset: 0 })
}

export async function fetchPurchasesPaginated(options: { limit: number; offset: number; query?: string }): Promise<IPurchaseWithSeller[]> {
    let db;
    try {
        db = initDb()
        const { limit, offset, query } = options
        const q = query?.trim()
        if (q) {
            const like = `%${q}%`
            const { results } = await db.executeAsync(
                `
                SELECT p.*, s.name AS seller_name
                FROM purchases p
                LEFT JOIN sellers s ON s.id = p.seller_id
                WHERE p.category LIKE ? OR s.name LIKE ?
                ORDER BY p.id DESC LIMIT ? OFFSET ?
            `,
                [like, like, limit, offset]
            );
            return results as unknown as IPurchaseWithSeller[]
        }
        const { results } = await db.executeAsync(
            `
            SELECT p.*, s.name AS seller_name
            FROM purchases p
            LEFT JOIN sellers s ON s.id = p.seller_id
            ORDER BY p.id DESC LIMIT ? OFFSET ?
        `,
            [limit, offset]
        );
        return results as unknown as IPurchaseWithSeller[]
    } catch (error) {
        throw new DatabaseError('Failed to fetch purchases', error)
    }
}

export async function countPurchases(query?: string): Promise<number> {
    let db;
    try {
        db = initDb()
        const q = query?.trim()
        if (q) {
            const like = `%${q}%`
            const { results } = await db.executeAsync(
                `SELECT COUNT(*) as count FROM purchases p LEFT JOIN sellers s ON s.id = p.seller_id WHERE p.category LIKE ? OR s.name LIKE ?`,
                [like, like]
            );
            return (results as unknown as Array<{ count: number }>)[0]?.count ?? 0
        }
        const { results } = await db.executeAsync(`SELECT COUNT(*) as count FROM purchases`);
        return (results as unknown as Array<{ count: number }>)[0]?.count ?? 0
    } catch (error) {
        throw new DatabaseError('Failed to count purchases', error)
    }
}

export async function createPurchase(purchaseData: Omit<IPurchase, 'id'>): Promise<number> {
    let db;
    try {
        const { price_id, seller_id, category, unit, unit_price, quantity, total } = purchaseData;

        if (!price_id || !category || !unit) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
        }
        if (!unit_price || unit_price <= 0) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
        }
        if (!quantity || !Number.isInteger(quantity) || quantity <= 0) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_QUANTITY)
        }
        if (!total || total <= 0) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
        }

        db = initDb()
        const { insertId } = await db.executeAsync(`
            INSERT INTO purchases (price_id, seller_id, category, unit, unit_price, quantity, total)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [price_id, seller_id ?? null, category, unit, unit_price, quantity, total]);

        return insertId as number;
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to create purchase', error)
    }
}
