import { open } from 'react-native-nitro-sqlite'
import { deleteSeller } from '../database/sellers'
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

describe('deleteSeller referential guard', () => {
    test('blocks deletion when purchases reference the seller (rolls back)', async () => {
        // Call order: BEGIN, SELECT purchases count, ROLLBACK
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ count: 2 }] }) // SELECT COUNT purchases
            .mockResolvedValueOnce({}) // ROLLBACK

        await expect(deleteSeller(5)).rejects.toThrow(
            'Cannot delete this seller because purchases reference it.'
        )
        expect(executeAsync).toHaveBeenCalledTimes(3)
        expect(executeAsync).toHaveBeenNthCalledWith(1, 'BEGIN IMMEDIATE')
        expect(executeAsync).toHaveBeenNthCalledWith(3, 'ROLLBACK')
        expect(open).toHaveBeenCalledTimes(1)
    })

    test('blocks deletion when payments reference the seller (rolls back)', async () => {
        // Call order: BEGIN, SELECT purchases count (0), SELECT payments count (2), ROLLBACK
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ count: 0 }] }) // SELECT COUNT purchases
            .mockResolvedValueOnce({ results: [{ count: 2 }] }) // SELECT COUNT payments
            .mockResolvedValueOnce({}) // ROLLBACK

        await expect(deleteSeller(5)).rejects.toThrow(
            'Cannot delete this seller because payments reference it.'
        )
        expect(executeAsync).toHaveBeenCalledTimes(4)
        expect(executeAsync).toHaveBeenNthCalledWith(1, 'BEGIN IMMEDIATE')
        expect(executeAsync).toHaveBeenNthCalledWith(4, 'ROLLBACK')
        expect(open).toHaveBeenCalledTimes(1)
    })

    test('deletes the seller when it has no purchases or payments (commits)', async () => {
        // Call order: BEGIN, SELECT purchases (0), SELECT payments (0), DELETE, COMMIT
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ count: 0 }] }) // SELECT COUNT purchases
            .mockResolvedValueOnce({ results: [{ count: 0 }] }) // SELECT COUNT payments
            .mockResolvedValueOnce({}) // DELETE
            .mockResolvedValueOnce({}) // COMMIT

        await expect(deleteSeller(5)).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenCalledTimes(5)
        expect(executeAsync).toHaveBeenNthCalledWith(5, 'COMMIT')
        expect(open).toHaveBeenCalledTimes(1)
    })

    test('rolls back when the delete fails', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ count: 0 }] }) // SELECT COUNT purchases
            .mockResolvedValueOnce({ results: [{ count: 0 }] }) // SELECT COUNT payments
            .mockRejectedValueOnce(new Error('disk error')) // DELETE
            .mockResolvedValueOnce({}) // ROLLBACK

        await expect(deleteSeller(5)).rejects.toThrow('Failed to delete seller')
        expect(executeAsync).toHaveBeenNthCalledWith(5, 'ROLLBACK')
    })
})
