import { open } from 'react-native-nitro-sqlite'
import { createPayment, fetchPaymentsPage } from '../database/payments'
import { __resetDbForTests } from '../database/connection'

jest.mock('react-native-nitro-sqlite', () => ({
    open: jest.fn(),
}))

const executeAsync = jest.fn()
const close = jest.fn()

beforeEach(() => {
    jest.clearAllMocks()
    __resetDbForTests()
    ;(open as jest.Mock).mockReturnValue({ executeAsync, close })
})

describe('createPayment overpayment guard', () => {
    test('blocks a payment that exceeds the outstanding balance (rolls back)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ total: 100 }] }) // SUM(total) owed
            .mockResolvedValueOnce({ results: [{ total: 50 }] }) // SUM(amount) paid
            .mockResolvedValueOnce({}) // ROLLBACK

        await expect(
            createPayment({ seller_id: 5, purchase_id: null, amount: 60, method: null, note: null })
        ).rejects.toThrow('Payment exceeds the outstanding balance.')

        expect(executeAsync).toHaveBeenCalledTimes(4)
        expect(executeAsync).toHaveBeenNthCalledWith(1, 'BEGIN IMMEDIATE')
        expect(executeAsync).toHaveBeenNthCalledWith(4, 'ROLLBACK')
    })

    test('records a payment within the balance and auto-links the oldest unlinked purchase', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ total: 100 }] }) // SUM(total) owed
            .mockResolvedValueOnce({ results: [{ total: 50 }] }) // SUM(amount) paid
            .mockResolvedValueOnce({ results: [{ id: 7 }] }) // oldest unlinked purchase
            .mockResolvedValueOnce({ insertId: 9 }) // INSERT
            .mockResolvedValueOnce({}) // COMMIT

        await expect(
            createPayment({ seller_id: 5, purchase_id: null, amount: 50, method: 'cash', note: null })
        ).resolves.toBe(9)

        expect(executeAsync).toHaveBeenNthCalledWith(
            5,
            expect.stringContaining('INSERT INTO payments'),
            [5, 7, 50, 'cash', null]
        )
        expect(executeAsync).toHaveBeenLastCalledWith('COMMIT')
    })

    test('keeps an explicit purchase link and skips the FIFO lookup', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ total: 100 }] }) // SUM(total) owed
            .mockResolvedValueOnce({ results: [{ total: 0 }] }) // SUM(amount) paid
            .mockResolvedValueOnce({ insertId: 4 }) // INSERT
            .mockResolvedValueOnce({}) // COMMIT

        await expect(
            createPayment({ seller_id: 5, purchase_id: 3, amount: 20, method: null, note: null })
        ).resolves.toBe(4)

        expect(executeAsync).toHaveBeenNthCalledWith(
            4,
            expect.stringContaining('INSERT INTO payments'),
            [5, 3, 20, null, null]
        )
        expect(executeAsync).toHaveBeenCalledTimes(5)
    })

    test('rejects non-positive amounts before touching the database', async () => {
        await expect(
            createPayment({ seller_id: 5, purchase_id: null, amount: 0, method: null, note: null })
        ).rejects.toThrow('Amount must be greater than zero.')

        expect(executeAsync).not.toHaveBeenCalled()
    })
})

describe('fetchPaymentsPage (keyset pagination per seller)', () => {
    test('scopes to the seller, applies the cursor and detects more pages', async () => {
        executeAsync.mockResolvedValueOnce({
            results: [
                { id: 5, seller_id: 2, purchase_id: null, amount: 10, method: null, note: null },
                { id: 4, seller_id: 2, purchase_id: null, amount: 10, method: null, note: null },
                { id: 3, seller_id: 2, purchase_id: null, amount: 10, method: null, note: null },
            ],
        })

        const { items, nextCursor } = await fetchPaymentsPage({ sellerId: 2, limit: 2, cursor: 6 })

        const [sql, params] = executeAsync.mock.calls[0]
        expect(sql).toContain('seller_id = ?')
        expect(sql).toContain('id < ?')
        expect(sql).toContain('ORDER BY id DESC LIMIT ?')
        expect(params).toEqual([2, 6, 3])
        expect(items.map((p) => p.id)).toEqual([5, 4])
        expect(nextCursor).toBe(4)
    })

    test('returns a null cursor when fewer rows than the limit are returned', async () => {
        executeAsync.mockResolvedValueOnce({
            results: [{ id: 2, seller_id: 2, purchase_id: null, amount: 10, method: null, note: null }],
        })

        const { items, nextCursor } = await fetchPaymentsPage({ sellerId: 2, limit: 5 })

        expect(items).toHaveLength(1)
        expect(nextCursor).toBeNull()
    })
})
