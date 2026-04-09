import { open } from 'react-native-nitro-sqlite'

const initDb = () => open({ name: 'plum_procurement.sqlite' });

export interface IPrice {
    id: number;
    price: number;
    unit: string;
    category: string;
    is_available: boolean;
}

export async function initializePrices(): Promise<void> {
    const db = initDb()
    await db.executeAsync(`
        CREATE TABLE IF NOT EXISTS prices ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            price REAL NOT NULl,
            unit TEXT NOT NULL,
            category TEXT,
            is_available BOOLEAN,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `)
    db.close()
}

export async function fetchPrices(): Promise<IPrice[]> {
    const db = initDb()
    const { results } = await db.executeAsync(`
        SELECT * FROM prices ORDER BY id DESC
    `);
    db.close();
    return results as unknown as IPrice[]
}

export async function createPrice(priceData: Omit<IPrice, 'id'>): Promise<number> {
    const { price, unit, category, is_available } = priceData;
    const db = initDb()
    const { insertId } = await db.executeAsync(`
        INSERT INTO prices (price, unit, category, is_available)
        VALUES (?, ?, ?, ?)
    `, [price, unit, category, is_available]);
    db.close()
    return insertId as number;
}

export async function truncatePrices(): Promise<void> {
    const db = initDb()
    await db.executeAsync(`DELETE FROM prices`)
    db.close()
}

export async function dropTblPrices() {
    const db = initDb()
    await db.executeAsync(`DROP TABLE IF EXISTS prices`)
    db.close()
}