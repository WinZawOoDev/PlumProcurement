import { open } from 'react-native-nitro-sqlite'
import { DATABASE_CONFIG, MESSAGES } from './constants'

const initDb = () => open({ name: DATABASE_CONFIG.NAME });

export interface IPrice {
    id: number;
    price: number;
    unit: string;
    category: string;
    is_available: boolean;
}

export class DatabaseError extends Error {
    constructor(message: string, public originalError?: unknown) {
        super(message)
        this.name = 'DatabaseError'
    }
}

export async function initializePrices(): Promise<void> {
    let db;
    try {
        db = initDb()
        await db.executeAsync(`
            CREATE TABLE IF NOT EXISTS prices ( 
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                price REAL NOT NULL,
                unit TEXT NOT NULL,
                category TEXT,
                is_available BOOLEAN,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `)
    } catch (error) {
        throw new DatabaseError('Failed to initialize prices table', error)
    } finally {
        db?.close()
    }
}

export async function fetchPrices(): Promise<IPrice[]> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(`
            SELECT * FROM prices ORDER BY id DESC
        `);
        return results as unknown as IPrice[]
    } catch (error) {
        throw new DatabaseError('Failed to fetch prices', error)
    } finally {
        db?.close()
    }
}

export async function createPrice(priceData: Omit<IPrice, 'id'>): Promise<number> {
    let db;
    try {
        const { price, unit, category, is_available } = priceData;
        
        // Validate input
        if (!price || price <= 0) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
        }
        if (!unit || !category) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
        }

        db = initDb()
        const { insertId } = await db.executeAsync(`
            INSERT INTO prices (price, unit, category, is_available)
            VALUES (?, ?, ?, ?)
        `, [price, unit, category, is_available]);
        
        return insertId as number;
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to create price', error)
    } finally {
        db?.close()
    }
}

export async function updatePrice(id: number, priceData: Partial<Omit<IPrice, 'id'>>): Promise<void> {
    let db;
    try {
        const updates: string[] = []
        const values: any[] = []

        if (priceData.price !== undefined) {
            if (priceData.price <= 0) {
                throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
            }
            updates.push('price = ?')
            values.push(priceData.price)
        }
        if (priceData.unit !== undefined) {
            updates.push('unit = ?')
            values.push(priceData.unit)
        }
        if (priceData.category !== undefined) {
            updates.push('category = ?')
            values.push(priceData.category)
        }
        if (priceData.is_available !== undefined) {
            updates.push('is_available = ?')
            values.push(priceData.is_available)
        }

        if (updates.length === 0) {
            return
        }

        updates.push('updated_at = CURRENT_TIMESTAMP')
        values.push(id)

        db = initDb()
        await db.executeAsync(`
            UPDATE prices 
            SET ${updates.join(', ')}
            WHERE id = ?
        `, values)
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to update price', error)
    } finally {
        db?.close()
    }
}

export async function deletePrice(id: number): Promise<void> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(
            `SELECT COUNT(*) AS count FROM purchases WHERE price_id = ?`,
            [id]
        );
        const referencedCount =
            (results as unknown as Array<{ count: number }>)[0]?.count ?? 0;
        if (referencedCount > 0) {
            throw new DatabaseError(MESSAGES.ERROR_PRICE_IN_USE)
        }
        await db.executeAsync(`DELETE FROM prices WHERE id = ?`, [id])
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to delete price', error)
    } finally {
        db?.close()
    }
}

export async function truncatePrices(): Promise<void> {
    let db;
    try {
        db = initDb()
        await db.executeAsync(`DELETE FROM prices`)
    } catch (error) {
        throw new DatabaseError('Failed to truncate prices table', error)
    } finally {
        db?.close()
    }
}

export async function dropTblPrices(): Promise<void> {
    let db;
    try {
        db = initDb()
        await db.executeAsync(`DROP TABLE IF EXISTS prices`)
    } catch (error) {
        throw new DatabaseError('Failed to drop prices table', error)
    } finally {
        db?.close()
    }
}

export interface IPurchase {
    id: number;
    price_id: number;
    seller_id: number | null;
    category: string;
    unit: string;
    unit_price: number;
    quantity: number;
    total: number;
}

export interface IPurchaseWithSeller extends IPurchase {
    seller_name: string | null;
}

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
    } finally {
        db?.close()
    }
}

export async function fetchPurchases(): Promise<IPurchaseWithSeller[]> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(`
            SELECT p.*, s.name AS seller_name
            FROM purchases p
            LEFT JOIN sellers s ON s.id = p.seller_id
            ORDER BY p.id DESC LIMIT 100
        `);
        return results as unknown as IPurchaseWithSeller[]
    } catch (error) {
        throw new DatabaseError('Failed to fetch purchases', error)
    } finally {
        db?.close()
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
    } finally {
        db?.close()
    }
}

export interface ISeller {
    id: number;
    name: string;
    phone: string | null;
}

export async function initializeSellers(): Promise<void> {
    let db;
    try {
        db = initDb()
        await db.executeAsync(`
            CREATE TABLE IF NOT EXISTS sellers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `)
    } catch (error) {
        throw new DatabaseError('Failed to initialize sellers table', error)
    } finally {
        db?.close()
    }
}

export async function fetchSellers(): Promise<ISeller[]> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(`
            SELECT * FROM sellers ORDER BY name ASC
        `);
        return results as unknown as ISeller[]
    } catch (error) {
        throw new DatabaseError('Failed to fetch sellers', error)
    } finally {
        db?.close()
    }
}

export async function createSeller(sellerData: Omit<ISeller, 'id'>): Promise<number> {
    let db;
    try {
        const { name, phone } = sellerData;

        if (!name || !name.trim()) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
        }

        db = initDb()
        const { insertId } = await db.executeAsync(`
            INSERT INTO sellers (name, phone)
            VALUES (?, ?)
        `, [name.trim(), phone ?? null]);

        return insertId as number;
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to create seller', error)
    } finally {
        db?.close()
    }
}

export async function updateSeller(id: number, sellerData: Partial<Omit<ISeller, 'id'>>): Promise<void> {
    let db;
    try {
        const updates: string[] = []
        const values: any[] = []

        if (sellerData.name !== undefined) {
            if (!sellerData.name.trim()) {
                throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
            }
            updates.push('name = ?')
            values.push(sellerData.name.trim())
        }
        if (sellerData.phone !== undefined) {
            updates.push('phone = ?')
            values.push(sellerData.phone)
        }

        if (updates.length === 0) {
            return
        }

        updates.push('updated_at = CURRENT_TIMESTAMP')
        values.push(id)

        db = initDb()
        await db.executeAsync(`
            UPDATE sellers
            SET ${updates.join(', ')}
            WHERE id = ?
        `, values)
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to update seller', error)
    } finally {
        db?.close()
    }
}

export async function deleteSeller(id: number): Promise<void> {
    let db;
    try {
        db = initDb()
        await db.executeAsync(`DELETE FROM sellers WHERE id = ?`, [id])
    } catch (error) {
        throw new DatabaseError('Failed to delete seller', error)
    } finally {
        db?.close()
    }
}