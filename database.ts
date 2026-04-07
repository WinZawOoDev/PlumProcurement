import { open } from 'react-native-nitro-sqlite'

const initDb = () => open({ name: 'plum_procurement.sqlite' });

export interface IPrice {
    id: number;
    price: number;
    unit: string;
    category: string;
    isAvailable: boolean;
}

export async function initializePrices(): Promise<void> {
    const db = initDb()
    await db.executeAsync(`
        CREATE TABLE IF NOT EXISTS prices ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            price REAL,
            unit TEXT,
            category TEXT,
            isAvailable BOOLEAN
        )
    `)
    db.close()
}

export async function fetchPrices(): Promise<IPrice[]> {
    const db = initDb()
    const { results } = await db.executeAsync(`SELECT * FROM prices`);
    db.close();
    return results as unknown as IPrice[]
}

export async function createPrice(priceData: Omit<IPrice, 'id'>): Promise<number> {
    const { price, unit, category, isAvailable } = priceData;
    const db = initDb()
    const { insertId } = await db.executeAsync(`
        INSERT INTO prices (price, unit, category, isAvailable)
        VALUES (?, ?, ?, ?)
    `, [price, unit, category, isAvailable]);
    db.close()
    return insertId as number;
}

export async function truncatePrices(): Promise<void> {
    const db = initDb()
    await db.executeAsync(`DELETE FROM prices`)
    db.close()
}