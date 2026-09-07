import { open } from 'react-native-nitro-sqlite'
import { createPayment } from '../database/payments'
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

    test('records a payment within the balance (commits)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ total: 100 }] }) // SUM(total) owed
            .mockResolvedValueOnce({ results: [{ total: 50 }] }) // SUM(amount) paid
            .mockResolvedValueOnce({ insertId: 9 }) // INSERT
            .mockResolvedValueOnce({}) // COMMIT

        await expect(
            createPayment({ seller_id: 5, purchase_id: null, amount: 50, method: 'cash', note: null })
        ).resolves.toBe(9)

        expect(executeAsync).toHaveBeenCalledTimes(5)
        expect(executeAsync).toHaveBeenNthCalledWith(5, 'COMMIT')
    })

    test('rejects non-positive amounts before touching the database', async () => {
        await expect(
            createPayment({ seller_id: 5, purchase_id: null, amount: 0, method: null, note: null })
        ).rejects.toThrow('Amount must be greater than zero.')

        expect(executeAsync).not.toHaveBeenCalled()
    })
})
