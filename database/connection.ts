import { open } from 'react-native-nitro-sqlite'
import { DATABASE_CONFIG } from '../constants'

export class DatabaseError extends Error {
    constructor(message: string, public originalError?: unknown) {
        super(message)
        this.name = 'DatabaseError'
    }
}

let _cachedDb: ReturnType<typeof open> | null = null
export const initDb = () => {
    if (_cachedDb) return _cachedDb
    _cachedDb = open({ name: DATABASE_CONFIG.NAME })
    return _cachedDb
}
export function __resetDbForTests() {
    _cachedDb = null
}
