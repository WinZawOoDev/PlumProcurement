import { MESSAGES } from '../constants'
import type { IPrice } from '../types/database'
import { DatabaseError, initDb } from './connection'
import { initializeSchema } from './schema'

export async function initializePrices(): Promise<void> {
    try {
        await initializeSchema()
    } catch (error) {
        throw new DatabaseError('Failed to initialize prices table', error)
    }
}

export async function fetchPrices(): Promise<IPrice[]> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(`
            SELECT * FROM prices ORDER BY id DESC
        `);
        // SQLite has no native BOOLEAN — is_available comes back as 0/1.
        // Normalize to a real boolean so UI truthiness is consistent.
        return (results as unknown as Array<Omit<IPrice, 'is_available'> & { is_available: unknown }>).map(
            (row) => ({ ...row, is_available: !!row.is_available } as IPrice)
        )
    } catch (error) {
        throw new DatabaseError('Failed to fetch prices', error)
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
        `, [price, unit, category, is_available ? 1 : 0]);

        return insertId as number;
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to create price', error)
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
            values.push(priceData.is_available ? 1 : 0)
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
    }
}

export async function deletePrice(id: number): Promise<void> {
    let db;
    try {
        db = initDb()
        // Guard + delete in a transaction so a concurrent purchase referencing
        // this price cannot slip in between the count check and the delete.
        await db.executeAsync(`BEGIN IMMEDIATE`)
        try {
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
            await db.executeAsync(`COMMIT`)
        } catch (innerError) {
            await db.executeAsync(`ROLLBACK`).catch(() => undefined)
            throw innerError
        }
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        if (isForeignKeyViolation(error)) {
            throw new DatabaseError(MESSAGES.ERROR_PRICE_IN_USE, error)
        }
        throw new DatabaseError('Failed to delete price', error)
    }
}

function isForeignKeyViolation(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error ?? '')
    return /foreign key|FOREIGN KEY|constraint failed/i.test(message)
}
