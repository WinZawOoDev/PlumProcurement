import { open } from 'react-native-nitro-sqlite'
import { fetchPurchasesPage } from '../database/purchases'
import { __resetDbForTests } from '../database/connection'

jest.mock('react-native-nitro-sqlite', () => ({
    open: jest.fn(),
}))

const executeAsync = jest.fn()
const close = jest.fn()

const row = (id: number) => ({
    id,
    price_id: 1,
    seller_id: null,
    category: 'fruit',
    unit: 'CUP',
    unit_price: 5,
    quantity: 1,
    total: 5,
    seller_name: null,
})

beforeEach(() => {
    jest.clearAllMocks()
    __resetDbForTests()
    ;(open as jest.Mock).mockReturnValue({ executeAsync, close })
})

describe('fetchPurchasesPage (keyset pagination)', () => {
    test('builds cursor + search WHERE clauses and fetches limit+1 rows', async () => {
        executeAsync.mockResolvedValue({ results: [row(30), row(20), row(10)] })

        const { items, nextCursor } = await fetchPurchasesPage({ limit: 2, cursor: 40, query: 'fruit' })

        const [sql, params] = executeAsync.mock.calls[0]
        expect(sql).toContain('p.id < ?')
        expect(sql).toContain('p.category LIKE ?')
        expect(sql).toContain('s.name LIKE ?')
        expect(sql).toContain('ORDER BY p.id DESC LIMIT ?')
        expect(params).toEqual([40, '%fruit%', '%fruit%', 3])
        expect(items.map((i) => i.id)).toEqual([30, 20])
        expect(nextCursor).toBe(20)
    })

    test('first page without cursor or query has no WHERE clause', async () => {
        executeAsync.mockResolvedValue({ results: [row(3), row(2), row(1)] })

        await fetchPurchasesPage({ limit: 2 })

        const [sql, params] = executeAsync.mock.calls[0]
        expect(sql).not.toContain('WHERE')
        expect(params).toEqual([3])
    })

    test('nextCursor is null when fewer rows than the limit are returned', async () => {
        executeAsync.mockResolvedValue({ results: [row(3), row(2)] })

        const { items, nextCursor } =         await fetchPurchasesPage({ limit: 5 })

        const [, params] = executeAsync.mock.calls[0]
        expect(params).toEqual([6])
        expect(items).toHaveLength(2)
        expect(nextCursor).toBeNull()
    })

    test('full page without an extra row means no more pages', async () => {
        executeAsync.mockResolvedValue({ results: [row(3), row(2)] })

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
