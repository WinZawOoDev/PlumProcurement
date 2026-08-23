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
        await db.executeAsync(`DELETE FROM prices WHERE id = ?`, [id])
    } catch (error) {
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
    category: string;
    unit: string;
    unit_price: number;
    quantity: number;
    total: number;
}

export async function initializePurchases(): Promise<void> {
    let db;
    try {
        db = initDb()
        await db.executeAsync(`
            CREATE TABLE IF NOT EXISTS purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                price_id INTEGER NOT NULL,
                category TEXT NOT NULL,
                unit TEXT NOT NULL,
                unit_price REAL NOT NULL,
                quantity INTEGER NOT NULL CHECK(quantity > 0),
                total REAL NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `)
    } catch (error) {
        throw new DatabaseError('Failed to initialize purchases table', error)
    } finally {
        db?.close()
    }
}

export async function fetchPurchases(): Promise<IPurchase[]> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(`
            SELECT * FROM purchases ORDER BY id DESC LIMIT 100
        `);
        return results as unknown as IPurchase[]
    } catch (error) {
        throw new DatabaseError('Failed to fetch purchases', error)
    } finally {
        db?.close()
    }
}

export async function createPurchase(purchaseData: Omit<IPurchase, 'id'>): Promise<number> {
    let db;
    try {
        const { price_id, category, unit, unit_price, quantity, total } = purchaseData;

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
            INSERT INTO purchases (price_id, category, unit, unit_price, quantity, total)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [price_id, category, unit, unit_price, quantity, total]);

        return insertId as number;
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to create purchase', error)
    } finally {
        db?.close()
    }
}