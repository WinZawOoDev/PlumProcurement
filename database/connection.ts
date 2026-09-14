import { open } from 'react-native-nitro-sqlite'
import { DATABASE_CONFIG } from '../constants'

export class DatabaseError extends Error {
    constructor(message: string, public originalError?: unknown) {
        super(message)
        this.name = 'DatabaseError'
    }
}

export type DbConnection = ReturnType<typeof open>
/**
 * Minimal surface shared by the connection and a transaction handle. Helpers
 * that must run inside a transaction accept this so they work whether they are
 * handed the raw connection or the `tx` from `db.transaction()`.
 */
export type DbExecutor = Pick<DbConnection, 'executeAsync'>

let _cachedDb: DbConnection | null = null
export const initDb = (): DbConnection => {
    if (_cachedDb) return _cachedDb
    _cachedDb = open({ name: DATABASE_CONFIG.NAME })
    return _cachedDb
}
export function __resetDbForTests() {
    _cachedDb = null
}
