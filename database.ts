import { NitroSQLiteConnection, open } from 'react-native-nitro-sqlite'


const initDb = () => open({ name: 'plum_procurement.sqlite' });

export async function initializePrices() {
    const db = initDb()
    await db.executeAsync(`
        CREATE TABLE IF NOT EXISTS prices ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            price REAL,
            unit TEXT,
            category TEXT,
            status BOOLEAN
        )
    `)
    db.close()
}

export async function fetchPrices() {
    const db = initDb()
    const { results } = await db.executeAsync(`SELECT * FROM prices`);
    db.close();
    return results
}


export async function createPrice(priceData: any) {
    const { price, unit, category, status } = priceData;
    const db = initDb()
    await db.executeAsync(`
        INSERT INTO prices (price, unit, category, status)
        VALUES (?, ?, ?, ?)
    `, [price, unit, category, status]);
    db.close()
}

