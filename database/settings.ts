import { DatabaseError, initDb } from './connection'
import { initializeSchema } from './schema'

export async function initializeSettings(): Promise<void> {
    try {
        await initializeSchema()
    } catch (error) {
        throw new DatabaseError('Failed to initialize settings table', error)
    }
}

export async function getSetting(key: string): Promise<string | null> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(
            `SELECT value FROM app_settings WHERE key = ?`,
            [key]
        );
        return (results as unknown as Array<{ value: string | null }>)[0]?.value ?? null
    } catch (error) {
        throw new DatabaseError('Failed to read setting', error)
    }
}

export async function setSetting(key: string, value: string): Promise<void> {
    let db;
    try {
        db = initDb()
        await db.executeAsync(
            `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`,
            [key, value]
        )
    } catch (error) {
        throw new DatabaseError('Failed to save setting', error)
    }
}
