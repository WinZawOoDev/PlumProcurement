import { open } from 'react-native-nitro-sqlite'

export const db = open({ name: 'plum_procurement.sqlite' })

export async function initializeDatabase() {
    await db.executeAsync(`
        CREATE TABLE IF NOT EXISTS prices ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            price REAL,
            unit TEXT,
            category TEXT,
            status TEXT
        )
    `)
}

export async function fetchPrices() {
    const { results } = await db.executeAsync(`SELECT * FROM prices`)
    db.close()
    return results
}


