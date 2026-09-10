import { open } from 'react-native-nitro-sqlite'
import { deletePurchase, updatePurchase } from '../database/purchases'
import { __resetDbForTests } from '../database/connection'
import { MESSAGES } from '../constants'

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

const item = { price_id: 1, category: 'fruit', unit: 'CUP', unit_price: 5, quantity: 1 }

describe('updatePurchase payment lock', () => {
    test('blocks edits when a payment is linked to the purchase (rolls back)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ '1': 1 }] }) // linked payment exists
            .mockResolvedValueOnce({}) // ROLLBACK

        await expect(updatePurchase(3, { items: [item] })).rejects.toThrow(
            MESSAGES.ERROR_PURCHASE_LOCKED
        )
        expect(executeAsync).toHaveBeenNthCalledWith(1, 'BEGIN IMMEDIATE')
        expect(executeAsync).toHaveBeenNthCalledWith(3, 'ROLLBACK')
    })

    test('allows edits when no payment is linked and the seller is not overpaid (commits)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [] }) // no linked payment
            .mockResolvedValueOnce({ results: [{ seller_id: 2, total: 10 }] }) // purchase
            .mockResolvedValueOnce({ results: [{ total: 10 }] }) // SUM(total) owed
            .mockResolvedValueOnce({ results: [{ total: 0 }] }) // SUM(amount) paid
            .mockResolvedValueOnce({}) // DELETE purchase_items
            .mockResolvedValueOnce({}) // INSERT purchase_item
            .mockResolvedValueOnce({}) // UPDATE purchases total
            .mockResolvedValueOnce({}) // COMMIT

        await expect(updatePurchase(3, { items: [item] })).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenLastCalledWith('COMMIT')
    })

    test('blocks edits that would overpay the seller (rolls back)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [] }) // no linked payment
            .mockResolvedValueOnce({ results: [{ seller_id: 2, total: 10 }] }) // purchase
            .mockResolvedValueOnce({ results: [{ total: 10 }] }) // SUM(total) owed
            .mockResolvedValueOnce({ results: [{ total: 10 }] }) // SUM(amount) paid
            .mockResolvedValueOnce({}) // ROLLBACK

        // new line total = 5, so owed would fall to 5 while 10 is already paid
        await expect(updatePurchase(3, { items: [item] })).rejects.toThrow(
            MESSAGES.ERROR_PURCHASE_OVERPAY
        )
        expect(executeAsync).toHaveBeenNthCalledWith(6, 'ROLLBACK')
    })

    test('allows edits for purchases with no seller (no payment lookup)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [] }) // no linked payment
            .mockResolvedValueOnce({ results: [{ seller_id: null, total: 10 }] }) // purchase
            .mockResolvedValueOnce({}) // DELETE purchase_items
            .mockResolvedValueOnce({}) // INSERT purchase_item
            .mockResolvedValueOnce({}) // UPDATE purchases total
            .mockResolvedValueOnce({}) // COMMIT

        await expect(updatePurchase(3, { items: [item] })).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenLastCalledWith('COMMIT')
    })
})

describe('deletePurchase payment lock', () => {
    test('blocks deletion when a payment is linked to the purchase (rolls back)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ '1': 1 }] }) // linked payment exists
            .mockResolvedValueOnce({}) // ROLLBACK

        await expect(deletePurchase(3)).rejects.toThrow(MESSAGES.ERROR_PURCHASE_LOCKED)
        expect(executeAsync).toHaveBeenNthCalledWith(1, 'BEGIN IMMEDIATE')
        expect(executeAsync).toHaveBeenNthCalledWith(3, 'ROLLBACK')
    })

    test('blocks deletion that would overpay the seller (rolls back)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [] }) // no linked payment
            .mockResolvedValueOnce({ results: [{ seller_id: 2, total: 10 }] }) // purchase
            .mockResolvedValueOnce({ results: [{ total: 20 }] }) // SUM(total) owed
            .mockResolvedValueOnce({ results: [{ total: 20 }] }) // SUM(amount) paid
            .mockResolvedValueOnce({}) // ROLLBACK

        await expect(deletePurchase(3)).rejects.toThrow(MESSAGES.ERROR_PURCHASE_OVERPAY)
        expect(executeAsync).toHaveBeenNthCalledWith(6, 'ROLLBACK')
    })

    test('deletes when no payment is linked and the seller is not overpaid (commits)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [] }) // no linked payment
            .mockResolvedValueOnce({ results: [{ seller_id: 2, total: 10 }] }) // purchase
            .mockResolvedValueOnce({ results: [{ total: 20 }] }) // SUM(total) owed
            .mockResolvedValueOnce({ results: [{ total: 5 }] }) // SUM(amount) paid
            .mockResolvedValueOnce({}) // DELETE
            .mockResolvedValueOnce({}) // COMMIT

        await expect(deletePurchase(3)).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenNthCalledWith(6, 'DELETE FROM purchases WHERE id = ?', [3])
        expect(executeAsync).toHaveBeenLastCalledWith('COMMIT')
    })

    test('deletes purchases with no seller (no payment lookup)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [] }) // no linked payment
            .mockResolvedValueOnce({ results: [{ seller_id: null, total: 10 }] }) // purchase
            .mockResolvedValueOnce({}) // DELETE
            .mockResolvedValueOnce({}) // COMMIT

        await expect(deletePurchase(3)).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenCalledTimes(5)
    })
})
