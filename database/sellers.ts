import { MESSAGES } from '../constants'
import type { ISeller } from '../types/database'
import { DatabaseError, initDb } from './connection'
import { initializeSchema } from './schema'

export async function initializeSellers(): Promise<void> {
    try {
        await initializeSchema()
    } catch (error) {
        throw new DatabaseError('Failed to initialize sellers table', error)
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
    }
}

export async function fetchSellerById(id: number): Promise<ISeller | null> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(`
            SELECT * FROM sellers WHERE id = ? LIMIT 1
        `, [id]);
        const rows = results as unknown as ISeller[]
        return rows[0] ?? null
    } catch (error) {
        throw new DatabaseError('Failed to fetch seller', error)
    }
}

export async function createSeller(sellerData: Omit<ISeller, 'id'>): Promise<number> {
    let db;
    try {
        const { name, phone, address } = sellerData;

        if (!name || !name.trim()) {
            throw new DatabaseError(MESSAGES.ERROR_INVALID_INPUT)
        }

        db = initDb()
        const { insertId } = await db.executeAsync(`
            INSERT INTO sellers (name, phone, address)
            VALUES (?, ?, ?)
        `, [name.trim(), phone ?? null, address ?? null]);

        return insertId as number;
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        throw new DatabaseError('Failed to create seller', error)
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
        if (sellerData.address !== undefined) {
            updates.push('address = ?')
            values.push(sellerData.address)
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
    }
}

export async function deleteSeller(id: number): Promise<void> {
    let db;
    try {
        db = initDb()
        // Guard + delete in a transaction so a concurrent purchase referencing
        // this seller cannot slip in between the count check and the delete.
        await db.executeAsync(`BEGIN IMMEDIATE`)
        try {
            const { results } = await db.executeAsync(
                `SELECT COUNT(*) AS count FROM purchases WHERE seller_id = ?`,
                [id]
            );
            const referencedCount =
                (results as unknown as Array<{ count: number }>)[0]?.count ?? 0;
            if (referencedCount > 0) {
                throw new DatabaseError(MESSAGES.ERROR_SELLER_IN_USE)
            }
            await db.executeAsync(`DELETE FROM sellers WHERE id = ?`, [id])
            await db.executeAsync(`COMMIT`)
        } catch (innerError) {
            await db.executeAsync(`ROLLBACK`).catch(() => undefined)
            throw innerError
        }
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        if (isForeignKeyViolation(error)) {
            throw new DatabaseError(MESSAGES.ERROR_SELLER_IN_USE, error)
        }
        throw new DatabaseError('Failed to delete seller', error)
    }
}

function isForeignKeyViolation(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error ?? '')
    return /foreign key|FOREIGN KEY|constraint failed/i.test(message)
}
