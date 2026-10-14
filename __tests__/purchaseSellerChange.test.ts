import { open } from 'react-native-nitro-sqlite'
import { deletePurchase, updatePurchase } from '../database/purchases'
import { __resetDbForTests } from '../database/connection'
import { MESSAGES } from '../constants'

jest.mock('react-native-nitro-sqlite', () => ({
    open: jest.fn(),
}))

const executeAsync = jest.fn()
const transaction = jest.fn()
const close = jest.fn()

beforeEach(() => {
    jest.clearAllMocks()
    __resetDbForTests()
    transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({ executeAsync, commit: jest.fn(), rollback: jest.fn() })
    )
    ;(open as jest.Mock).mockReturnValue({ executeAsync, transaction, close })
})

const item = { price_id: 1, category: 'fruit', unit: 'CUP', unit_price: 5, quantity: 1 }

describe('updatePurchase seller change', () => {
    test('moving a purchase out blocks when the old seller would be overpaid', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] }) // not locked
            .mockResolvedValueOnce({ results: [{ seller_id: 2, total: 10 }] }) // existing
            .mockResolvedValueOnce({ results: [{ total: 10 }] }) // old seller owed
            .mockResolvedValueOnce({ results: [{ total: 10 }] }) // old seller paid -> 10 > 0

        await expect(updatePurchase(3, { seller_id: 7 })).rejects.toThrow(
            MESSAGES.ERROR_PURCHASE_OVERPAY
        )
    })

    test('moving a purchase checks the new seller too', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] }) // not locked
            .mockResolvedValueOnce({ results: [{ seller_id: 2, total: 10 }] }) // existing
            .mockResolvedValueOnce({ results: [{ total: 50 }] }) // old seller owed
            .mockResolvedValueOnce({ results: [{ total: 0 }] }) // old seller paid (ok)
            .mockResolvedValueOnce({ results: [{ ok: 1 }] }) // new seller exists
            .mockResolvedValueOnce({ results: [{ total: 5 }] }) // new seller owed
            .mockResolvedValueOnce({ results: [{ total: 20 }] }) // new seller paid -> 20 > 15

        await expect(updatePurchase(3, { seller_id: 7 })).rejects.toThrow(
            MESSAGES.ERROR_PURCHASE_OVERPAY
        )
    })

    test('rejects unknown purchases instead of silently succeeding', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] }) // not locked
            .mockResolvedValueOnce({ results: [] }) // missing

        await expect(updatePurchase(999, { items: [item] })).rejects.toThrow(
            MESSAGES.ERROR_PURCHASE_NOT_FOUND
        )
    })

    test('delete rejects unknown purchases', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] }) // not locked
            .mockResolvedValueOnce({ results: [] }) // missing

        await expect(deletePurchase(999)).rejects.toThrow(MESSAGES.ERROR_PURCHASE_NOT_FOUND)
    })
})
