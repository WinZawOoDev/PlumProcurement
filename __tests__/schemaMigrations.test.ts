import { open } from 'react-native-nitro-sqlite'
import { initializeSchema, __resetSchemaForTests } from '../database/schema'
import { __resetMigrationsForTests } from '../database/migrations'
import { __resetDbForTests, DatabaseError } from '../database/connection'

jest.mock('react-native-nitro-sqlite', () => ({
    open: jest.fn(),
}))

const executeAsync = jest.fn()
const close = jest.fn()

const queries = () => executeAsync.mock.calls.map((call) => String(call[0]))

beforeEach(() => {
    jest.clearAllMocks()
    executeAsync.mockResolvedValue({ results: [], insertId: 1 })
    __resetDbForTests()
    __resetSchemaForTests()
    __resetMigrationsForTests()
    ;(open as jest.Mock).mockReturnValue({ executeAsync, close })
})

describe('initializeSchema', () => {
    test('creates all tables, applies migrations and sets user_version once', async () => {
        await expect(initializeSchema()).resolves.toBeUndefined()

        const sql = queries()
        expect(sql.filter((q) => q.includes('CREATE TABLE IF NOT EXISTS prices'))).toHaveLength(1)
        expect(sql.filter((q) => q.includes('CREATE TABLE IF NOT EXISTS sellers'))).toHaveLength(1)
        expect(sql.filter((q) => q.includes('CREATE TABLE IF NOT EXISTS purchases'))).toHaveLength(1)
        expect(sql.filter((q) => q.includes('CREATE TABLE IF NOT EXISTS app_settings'))).toHaveLength(1)
        expect(sql).toContain('PRAGMA user_version')
        expect(sql).toContain('PRAGMA user_version = 1')
        expect(sql.some((q) => q.includes('CREATE INDEX IF NOT EXISTS idx_purchases_price_id'))).toBe(true)
        expect(sql.some((q) => q.includes('CREATE INDEX IF NOT EXISTS idx_sellers_name'))).toBe(true)
    })

    test('is memoized — repeated calls do not re-run statements', async () => {
        await initializeSchema()
        const callsAfterFirst = executeAsync.mock.calls.length
        await initializeSchema()
        await initializeSchema()
        expect(executeAsync.mock.calls.length).toBe(callsAfterFirst)
    })

    test('skips migrations when the schema version is current', async () => {
        executeAsync.mockImplementation(async (query: string) => {
            if (query === 'PRAGMA user_version') {
                return { results: [{ user_version: 2 }] }
            }
            return { results: [], insertId: 1 }
        })

        await expect(initializeSchema()).resolves.toBeUndefined()

        expect(queries().some((q) => q.includes('ALTER TABLE purchases'))).toBe(false)
        // user_version already applied — no migration statements, no version bump
        expect(queries().some((q) => q.includes('PRAGMA user_version ='))).toBe(false)
    })

    test('adds address column when missing (legacy installs)', async () => {
        executeAsync.mockImplementation(async (query: string) => {
            if (query === 'PRAGMA table_info(purchases)') {
                return { results: [{ name: 'id' }, { name: 'seller_id' }] }
            }
            if (query === 'PRAGMA table_info(sellers)') {
                return { results: [{ name: 'id' }, { name: 'name' }] }
            }
            return { results: [], insertId: 1 }
        })

        await expect(initializeSchema()).resolves.toBeUndefined()
        expect(queries().some((q) => q.includes('ALTER TABLE sellers ADD COLUMN address'))).toBe(true)
    })

    test('adds seller_id column when missing (legacy installs)', async () => {
        executeAsync.mockImplementation(async (query: string) => {
            if (query === 'PRAGMA table_info(purchases)') {
                return { results: [{ name: 'id' }] }
            }
            return { results: [], insertId: 1 }
        })

        await expect(initializeSchema()).resolves.toBeUndefined()
        expect(queries().some((q) => q.includes('ALTER TABLE purchases ADD COLUMN seller_id'))).toBe(true)
    })

    test('resets and retries after a failed bootstrap', async () => {
        executeAsync.mockRejectedValueOnce(new Error('disk error'))
        await expect(initializeSchema()).rejects.toThrow(DatabaseError)

        executeAsync.mockResolvedValue({ results: [], insertId: 1 })
        await expect(initializeSchema()).resolves.toBeUndefined()
    })
})
