import { open } from 'react-native-nitro-sqlite'
import { fetchPurchasesPage, fetchRecentPurchases } from '../database/purchases'
import { __resetDbForTests } from '../database/connection'

jest.mock('react-native-nitro-sqlite', () => ({
    open: jest.fn(),
}))

const executeAsync = jest.fn()
const close = jest.fn()

const headerRow = (id: number) => ({
    id,
    seller_id: null,
    total: 5,
    created_at: '2026-09-01 10:00:00',
    seller_name: null,
})

const itemRow = (id: number, purchaseId: number) => ({
    id,
    purchase_id: purchaseId,
    price_id: 1,
    category: 'fruit',
    unit: 'CUP',
    unit_price: 5,
    quantity: 1,
    line_total: 5,
})

beforeEach(() => {
    jest.clearAllMocks()
    __resetDbForTests()
    ;(open as jest.Mock).mockReturnValue({ executeAsync, close })
})

describe('fetchPurchasesPage (keyset pagination over normalized purchases)', () => {
    test('builds cursor + search WHERE clauses and attaches line items', async () => {
        executeAsync.mockImplementation(async (query: string) => {
            if (query.includes('SELECT * FROM purchase_items')) {
                return { results: [itemRow(1, 30), itemRow(2, 20)] }
            }
            return { results: [headerRow(30), headerRow(20), headerRow(10)] }
        })

        const { items, nextCursor } = await fetchPurchasesPage({ limit: 2, cursor: 40, query: 'fruit' })

        const [headerSql, headerParams] = executeAsync.mock.calls[0]
        expect(headerSql).toContain('p.id < ?')
        expect(headerSql).toContain('s.name LIKE ?')
        expect(headerSql).toContain('EXISTS')
        expect(headerSql).toContain('ORDER BY p.id DESC LIMIT ?')
        expect(headerParams).toEqual([40, '%fruit%', '%fruit%', '%fruit%', 3])

        expect(items.map((i) => i.id)).toEqual([30, 20])
        expect(items[0].items).toHaveLength(1)
        expect(items[0].items[0].category).toBe('fruit')
        expect(nextCursor).toBe(20)
    })

    test('first page without cursor or query has no WHERE clause', async () => {
        executeAsync.mockImplementation(async (query: string) => {
            if (query.includes('SELECT * FROM purchase_items')) {
                return { results: [] }
            }
            return { results: [headerRow(3), headerRow(2), headerRow(1)] }
        })

        await fetchPurchasesPage({ limit: 2 })

        const [sql, params] = executeAsync.mock.calls[0]
        expect(sql).not.toContain('WHERE')
        expect(params).toEqual([3])
    })

    test('nextCursor is null when fewer rows than the limit are returned', async () => {
        executeAsync.mockImplementation(async (query: string) => {
            if (query.includes('SELECT * FROM purchase_items')) {
                return { results: [] }
            }
            return { results: [headerRow(3), headerRow(2)] }
        })

        const { items, nextCursor } = await fetchPurchasesPage({ limit: 5 })

        const [, params] = executeAsync.mock.calls[0]
        expect(params).toEqual([6])
        expect(items).toHaveLength(2)
        expect(nextCursor).toBeNull()
    })

    test('full page without an extra row means no more pages', async () => {
        executeAsync.mockImplementation(async (query: string) => {
            if (query.includes('SELECT * FROM purchase_items')) {
                return { results: [] }
            }
            return { results: [headerRow(3), headerRow(2)] }
        })

        const { nextCursor } = await fetchPurchasesPage({ limit: 2 })

        expect(nextCursor).toBeNull()
    })

    test('empty result set yields no items and null cursor', async () => {
        executeAsync.mockResolvedValue({ results: [] })

        const { items, nextCursor } = await fetchPurchasesPage({ limit: 5, cursor: 10 })

        expect(items).toEqual([])
        expect(nextCursor).toBeNull()
    })
})

describe('fetchRecentPurchases', () => {
    test('runs a single bounded page query instead of paging the whole table', async () => {
        executeAsync.mockImplementation(async (query: string) => {
            if (query.includes('SELECT * FROM purchase_items')) {
                return { results: [itemRow(1, 30)] }
            }
            return { results: [headerRow(30), headerRow(20), headerRow(10)] }
        })

        const items = await fetchRecentPurchases(2)

        // One header query + one item query — no cursor loop.
        expect(executeAsync).toHaveBeenCalledTimes(2)
        const [headerSql, headerParams] = executeAsync.mock.calls[0]
        expect(headerSql).toContain('ORDER BY p.id DESC LIMIT ?')
        expect(headerParams).toEqual([3])
        expect(items.map((i) => i.id)).toEqual([30, 20])
        expect(items[0].items).toHaveLength(1)
    })
})
