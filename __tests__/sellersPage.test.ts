import { open } from 'react-native-nitro-sqlite'
import { countSellers, fetchSellersPage } from '../database/sellers'
import { __resetDbForTests } from '../database/connection'

jest.mock('react-native-nitro-sqlite', () => ({
    open: jest.fn(),
}))

const executeAsync = jest.fn()
const close = jest.fn()

const sellerRow = (id: number, name: string) => ({
    id,
    name,
    phone: null,
    address: null,
    purchase_count: 0,
    total_spent: 0,
    balance: 0,
})

beforeEach(() => {
    jest.clearAllMocks()
    __resetDbForTests()
    ;(open as jest.Mock).mockReturnValue({ executeAsync, close })
})

describe('fetchSellersPage (keyset pagination + stats)', () => {
    test('fetches one extra row, rolls in stats/balance and returns a composite cursor', async () => {
        executeAsync.mockResolvedValueOnce({
            results: [sellerRow(1, 'Daw Mya'), sellerRow(2, 'U Ba'), sellerRow(3, 'U Kyaw')],
        })

        const { items, nextCursor } = await fetchSellersPage({ limit: 2 })

        const [sql, params] = executeAsync.mock.calls[0]
        expect(sql).toContain('LEFT JOIN')
        expect(sql).toContain('purchase_count')
        expect(sql).toContain('balance')
        expect(sql).toContain('ORDER BY s.name ASC, s.id ASC')
        expect(sql).toContain('LIMIT ?')
        expect(params).toEqual([3])
        expect(items.map((s) => s.name)).toEqual(['Daw Mya', 'U Ba'])
        expect(nextCursor).toEqual({ name: 'U Ba', id: 2 })
    })

    test('applies the search filter and the (name, id) cursor', async () => {
        executeAsync.mockResolvedValueOnce({ results: [sellerRow(5, 'U Ba')] })

        await fetchSellersPage({
            limit: 20,
            cursor: { name: 'Daw Mya', id: 2 },
            query: 'ba',
        })

        const [sql, params] = executeAsync.mock.calls[0]
        expect(sql).toContain('s.name LIKE ?')
        expect(sql).toContain('s.phone LIKE ?')
        expect(sql).toContain('s.name > ? OR (s.name = ? AND s.id > ?)')
        expect(params).toEqual(['%ba%', '%ba%', 'Daw Mya', 'Daw Mya', 2, 21])
    })

    test('returns a null cursor when fewer rows than the limit are returned', async () => {
        executeAsync.mockResolvedValueOnce({ results: [sellerRow(1, 'U Ba')] })

        const { items, nextCursor } = await fetchSellersPage({ limit: 5 })

        expect(items).toHaveLength(1)
        expect(nextCursor).toBeNull()
    })
})

describe('countSellers', () => {
    test('counts with the shared search filter', async () => {
        executeAsync.mockResolvedValueOnce({ results: [{ count: 7 }] })

        await expect(countSellers('ba')).resolves.toBe(7)

        const [sql, params] = executeAsync.mock.calls[0]
        expect(sql).toContain('COUNT(*) AS count')
        expect(sql).toContain('s.name LIKE ?')
        expect(params).toEqual(['%ba%', '%ba%'])
    })

    test('has no WHERE clause when no query is supplied', async () => {
        executeAsync.mockResolvedValueOnce({ results: [{ count: 3 }] })

        await expect(countSellers()).resolves.toBe(3)

        const [sql, params] = executeAsync.mock.calls[0]
        expect(sql).not.toContain('WHERE')
        expect(params).toEqual([])
    })
})
