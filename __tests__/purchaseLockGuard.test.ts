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

const item = { price_id: 1, category: 'fruit', unit: 'CUP', unit_price: 5, quantity: 2 }

describe('updatePurchase FIFO payment lock', () => {
    test('blocks edits when payments fully cover the purchase and earlier ones (rolls back)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ seller_id: 2 }] }) // SELECT seller_id
            .mockResolvedValueOnce({ results: [{ total: 20 }] }) // SUM(total) through this purchase
            .mockResolvedValueOnce({ results: [{ total: 20 }] }) // SUM(amount) paid
            .mockResolvedValueOnce({}) // ROLLBACK

        await expect(updatePurchase(3, { items: [item] })).rejects.toThrow(
            MESSAGES.ERROR_PURCHASE_LOCKED
        )
        expect(executeAsync).toHaveBeenNthCalledWith(1, 'BEGIN IMMEDIATE')
        expect(executeAsync).toHaveBeenNthCalledWith(5, 'ROLLBACK')
    })

    test('allows edits while the seller still owes on this purchase (commits)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ seller_id: 2 }] }) // SELECT seller_id
            .mockResolvedValueOnce({ results: [{ total: 20 }] }) // SUM(total) through this purchase
            .mockResolvedValueOnce({ results: [{ total: 10 }] }) // SUM(amount) paid (partial)
            .mockResolvedValueOnce({}) // DELETE purchase_items
            .mockResolvedValueOnce({}) // INSERT purchase_item
            .mockResolvedValueOnce({}) // UPDATE purchases total
            .mockResolvedValueOnce({}) // COMMIT

        await expect(updatePurchase(3, { items: [item] })).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenLastCalledWith('COMMIT')
    })

    test('allows edits for purchases with no seller (no payment lookup)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ seller_id: null }] }) // SELECT seller_id
            .mockResolvedValueOnce({}) // DELETE purchase_items
            .mockResolvedValueOnce({}) // INSERT purchase_item
            .mockResolvedValueOnce({}) // UPDATE purchases total
            .mockResolvedValueOnce({}) // COMMIT

        await expect(updatePurchase(3, { items: [item] })).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenLastCalledWith('COMMIT')
    })
})

describe('deletePurchase FIFO payment lock', () => {
    test('blocks deletion when payments fully cover the purchase and earlier ones (rolls back)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ seller_id: 2 }] }) // SELECT seller_id
            .mockResolvedValueOnce({ results: [{ total: 20 }] }) // SUM(total) through this purchase
            .mockResolvedValueOnce({ results: [{ total: 20 }] }) // SUM(amount) paid
            .mockResolvedValueOnce({}) // ROLLBACK

        await expect(deletePurchase(3)).rejects.toThrow(MESSAGES.ERROR_PURCHASE_LOCKED)
        expect(executeAsync).toHaveBeenNthCalledWith(1, 'BEGIN IMMEDIATE')
        expect(executeAsync).toHaveBeenNthCalledWith(5, 'ROLLBACK')
    })

    test('deletes while the purchase is not fully covered (commits)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ seller_id: 2 }] }) // SELECT seller_id
            .mockResolvedValueOnce({ results: [{ total: 20 }] }) // SUM(total) through this purchase
            .mockResolvedValueOnce({ results: [{ total: 10 }] }) // SUM(amount) paid (partial)
            .mockResolvedValueOnce({}) // DELETE
            .mockResolvedValueOnce({}) // COMMIT

        await expect(deletePurchase(3)).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenLastCalledWith('COMMIT')
    })

    test('deletes purchases with no seller (no payment lookup)', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ seller_id: null }] }) // SELECT seller_id
            .mockResolvedValueOnce({}) // DELETE
            .mockResolvedValueOnce({}) // COMMIT

        await expect(deletePurchase(3)).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenNthCalledWith(3, 'DELETE FROM purchases WHERE id = ?', [3])
        expect(executeAsync).toHaveBeenCalledTimes(4)
    })
})
