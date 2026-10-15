import { tMessage } from '../i18n'
import type { IPrice } from '../types/database'
import { DatabaseError, initDb } from './connection'
import { fromMinor, toMinor } from './money'
import { initializeSchema } from './schema'
import { isForeignKeyViolation, isUniqueViolation } from './sql'

export async function initializePrices(): Promise<void> {
    await initializeSchema()
}

function toMajorPrice(row: IPrice): IPrice {
    return { ...row, price: fromMinor(row.price) }
}

export async function fetchPrices(): Promise<IPrice[]> {
    let db;
    try {
        db = initDb()
        const { results } = await db.executeAsync(`
            SELECT * FROM prices ORDER BY id DESC
        `);
        return (results as unknown as IPrice[]).map(toMajorPrice)
    } catch (error) {
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

export async function createPrice(priceData: Omit<IPrice, 'id'>): Promise<number> {
    let db;
    try {
        const { price, unit, category } = priceData;

        // Validate input
        if (!Number.isFinite(price) || price <= 0) {
            throw new DatabaseError(tMessage('ERROR_INVALID_INPUT'))
        }
        const cleanCategory = category?.trim()
        const cleanUnit = unit?.trim()
        if (!cleanCategory || !cleanUnit) {
            throw new DatabaseError(tMessage('ERROR_INVALID_INPUT'))
        }

        db = initDb()
        // Check + insert in one queued transaction. The unique index created by
        // migration v8 enforces (category, unit) at the storage layer, but an
        // existing install can be left without that index, so the duplicate
        // check is also performed here to guarantee the constraint everywhere.
        return await db.transaction(async (tx) => {
            const { results } = await tx.executeAsync(
                `SELECT id FROM prices WHERE category IS ? AND unit IS ? LIMIT 1`,
                [cleanCategory, cleanUnit]
            );
            if ((results as unknown as Array<{ id: number }>).length > 0) {
                throw new DatabaseError(tMessage('ERROR_PRICE_EXISTS'))
            }

            const { insertId } = await tx.executeAsync(`
                INSERT INTO prices (price, unit, category)
                VALUES (?, ?, ?)
            `, [toMinor(price), cleanUnit, cleanCategory]);

            return insertId as number;
        })
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        if (isUniqueViolation(error)) {
            throw new DatabaseError(tMessage('ERROR_PRICE_EXISTS'), error)
        }
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

export async function updatePrice(id: number, priceData: Partial<Omit<IPrice, 'id'>>): Promise<void> {
    let db;
    try {
        const updates: string[] = []
        const values: any[] = []

        if (priceData.price !== undefined) {
            if (!Number.isFinite(priceData.price) || priceData.price <= 0) {
                throw new DatabaseError(tMessage('ERROR_INVALID_INPUT'))
            }
            updates.push('price = ?')
            values.push(toMinor(priceData.price))
        }
        if (priceData.unit !== undefined) {
            const cleanUnit = priceData.unit?.trim()
            if (!cleanUnit) {
                throw new DatabaseError(tMessage('ERROR_INVALID_INPUT'))
            }
            updates.push('unit = ?')
            values.push(cleanUnit)
        }
        if (priceData.category !== undefined) {
            const cleanCategory = priceData.category?.trim()
            if (!cleanCategory) {
                throw new DatabaseError(tMessage('ERROR_INVALID_INPUT'))
            }
            updates.push('category = ?')
            values.push(cleanCategory)
        }

        if (updates.length === 0) {
            return
        }

        updates.push('updated_at = CURRENT_TIMESTAMP')
        values.push(id)

        db = initDb()
        await db.transaction(async (tx) => {
            // Guard the merged row (unchanged fields keep their stored value)
            // against colliding with another price, mirroring createPrice so the
            // rule holds even when the unique index is absent. The comparison
            // uses the trimmed values actually being stored.
            const { results } = await tx.executeAsync(
                `SELECT category, unit FROM prices WHERE id = ?`,
                [id]
            );
            const current = (results as unknown as Array<{
                category: string
                unit: string
            }>)[0];
            if (!current) {
                throw new DatabaseError(tMessage('ERROR_NOT_FOUND'))
            }
            const nextCategory = priceData.category?.trim() ?? current.category
            const nextUnit = priceData.unit?.trim() ?? current.unit
            const { results: duplicates } = await tx.executeAsync(
                `SELECT id FROM prices WHERE category IS ? AND unit IS ? AND id <> ? LIMIT 1`,
                [nextCategory, nextUnit, id]
            );
            if ((duplicates as unknown as Array<{ id: number }>).length > 0) {
                throw new DatabaseError(tMessage('ERROR_PRICE_EXISTS'))
            }

            const updateResult = await tx.executeAsync(`
                UPDATE prices 
                SET ${updates.join(', ')}
                WHERE id = ?
            `, values)
            if (updateResult.rowsAffected === 0) {
                throw new DatabaseError(tMessage('ERROR_NOT_FOUND'))
            }
        })
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        if (isUniqueViolation(error)) {
            throw new DatabaseError(tMessage('ERROR_PRICE_EXISTS'), error)
        }
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}

export async function deletePrice(id: number): Promise<void> {
    let db;
    try {
        db = initDb()
        // Guard + delete in a queued transaction so a concurrent purchase
        // referencing this price cannot slip in between the count check and
        // the delete.
        await db.transaction(async (tx) => {
            const { results } = await tx.executeAsync(
                `SELECT COUNT(*) AS count FROM purchase_items WHERE price_id = ?`,
                [id]
            );
            const referencedCount =
                (results as unknown as Array<{ count: number }>)[0]?.count ?? 0;
            if (referencedCount > 0) {
                throw new DatabaseError(tMessage('ERROR_PRICE_IN_USE'))
            }
            const deleteResult = await tx.executeAsync(`DELETE FROM prices WHERE id = ?`, [id])
            if (deleteResult.rowsAffected === 0) {
                throw new DatabaseError(tMessage('ERROR_NOT_FOUND'))
            }
        })
    } catch (error) {
        if (error instanceof DatabaseError) throw error
        if (isForeignKeyViolation(error)) {
            throw new DatabaseError(tMessage('ERROR_PRICE_IN_USE'), error)
        }
        throw new DatabaseError(tMessage('ERROR_DATABASE'), error)
    }
}
