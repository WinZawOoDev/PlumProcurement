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

describe('updatePurchase payment lock', () => {
    test('blocks edits when a payment is linked to the purchase', async () => {
        executeAsync.mockResolvedValueOnce({ results: [{ '1': 1 }] }) // linked payment exists

        await expect(updatePurchase(3, { items: [item] })).rejects.toThrow(
            MESSAGES.ERROR_PURCHASE_LOCKED
        )
        expect(transaction).toHaveBeenCalledTimes(1)
        expect(executeAsync).toHaveBeenCalledTimes(1)
        expect(executeAsync).not.toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM purchase_items'),
            expect.anything()
        )
    })

    test('allows edits when no payment is linked and the seller is not overpaid', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] }) // no linked payment
            .mockResolvedValueOnce({ results: [{ seller_id: 2, total: 10 }] }) // purchase
            .mockResolvedValueOnce({ results: [{ total: 10 }] }) // SUM(total) owed
            .mockResolvedValueOnce({ results: [{ total: 0 }] }) // SUM(amount) paid
            .mockResolvedValueOnce({}) // DELETE purchase_items
            .mockResolvedValueOnce({}) // INSERT purchase_item
            .mockResolvedValueOnce({}) // UPDATE purchases total

        await expect(updatePurchase(3, { items: [item] })).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenLastCalledWith(
            expect.stringContaining('UPDATE purchases SET total'),
            [5, 3]
        )
    })

    test('blocks edits that would overpay the seller', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] }) // no linked payment
            .mockResolvedValueOnce({ results: [{ seller_id: 2, total: 10 }] }) // purchase
            .mockResolvedValueOnce({ results: [{ total: 10 }] }) // SUM(total) owed
            .mockResolvedValueOnce({ results: [{ total: 10 }] }) // SUM(amount) paid

        // new line total = 5, so owed would fall to 5 while 10 is already paid
        await expect(updatePurchase(3, { items: [item] })).rejects.toThrow(
            MESSAGES.ERROR_PURCHASE_OVERPAY
        )
        expect(executeAsync).toHaveBeenCalledTimes(4)
        expect(executeAsync).not.toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM purchase_items'),
            expect.anything()
        )
    })

    test('allows edits for purchases with no seller (no payment lookup)', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] }) // no linked payment
            .mockResolvedValueOnce({ results: [{ seller_id: null, total: 10 }] }) // purchase
            .mockResolvedValueOnce({}) // DELETE purchase_items
            .mockResolvedValueOnce({}) // INSERT purchase_item
            .mockResolvedValueOnce({}) // UPDATE purchases total

        await expect(updatePurchase(3, { items: [item] })).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenCalledTimes(5)
    })
})

describe('deletePurchase payment lock', () => {
    test('blocks deletion when a payment is linked to the purchase', async () => {
        executeAsync.mockResolvedValueOnce({ results: [{ '1': 1 }] }) // linked payment exists

        await expect(deletePurchase(3)).rejects.toThrow(MESSAGES.ERROR_PURCHASE_LOCKED)
        expect(executeAsync).toHaveBeenCalledTimes(1)
    })

    test('blocks deletion that would overpay the seller', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] }) // no linked payment
            .mockResolvedValueOnce({ results: [{ seller_id: 2, total: 10 }] }) // purchase
            .mockResolvedValueOnce({ results: [{ total: 20 }] }) // SUM(total) owed
            .mockResolvedValueOnce({ results: [{ total: 20 }] }) // SUM(amount) paid

        await expect(deletePurchase(3)).rejects.toThrow(MESSAGES.ERROR_PURCHASE_OVERPAY)
        expect(executeAsync).toHaveBeenCalledTimes(4)
    })

    test('deletes when no payment is linked and the seller is not overpaid (commits)', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] }) // no linked payment
            .mockResolvedValueOnce({ results: [{ seller_id: 2, total: 10 }] }) // purchase
            .mockResolvedValueOnce({ results: [{ total: 20 }] }) // SUM(total) owed
            .mockResolvedValueOnce({ results: [{ total: 5 }] }) // SUM(amount) paid
            .mockResolvedValueOnce({}) // DELETE

        await expect(deletePurchase(3)).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenLastCalledWith('DELETE FROM purchases WHERE id = ?', [3])
    })

    test('deletes purchases with no seller (no payment lookup)', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] }) // no linked payment
            .mockResolvedValueOnce({ results: [{ seller_id: null, total: 10 }] }) // purchase
            .mockResolvedValueOnce({}) // DELETE

        await expect(deletePurchase(3)).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenCalledTimes(3)
    })
})
