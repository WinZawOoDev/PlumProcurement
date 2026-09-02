import { open } from 'react-native-nitro-sqlite'
import { deletePrice } from '../database/prices'
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

describe('deletePrice referential guard', () => {
    test('blocks deletion when purchases reference the price (rolls back)', async () => {
        // Call order: BEGIN, SELECT count, ROLLBACK
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ count: 3 }] }) // SELECT COUNT
            .mockResolvedValueOnce({}) // ROLLBACK

        await expect(deletePrice(5)).rejects.toThrow(
            'Cannot delete this price because purchases reference it.'
        )
        expect(executeAsync).toHaveBeenCalledTimes(3)
        expect(executeAsync).toHaveBeenNthCalledWith(1, 'BEGIN IMMEDIATE')
        expect(executeAsync).toHaveBeenNthCalledWith(3, 'ROLLBACK')
        expect(open).toHaveBeenCalledTimes(1)
    })

    test('deletes the price when it has no purchases (commits)', async () => {
        // Call order: BEGIN, SELECT count, DELETE, COMMIT
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ count: 0 }] }) // SELECT COUNT
            .mockResolvedValueOnce({}) // DELETE
            .mockResolvedValueOnce({}) // COMMIT

        await expect(deletePrice(5)).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenCalledTimes(4)
        expect(executeAsync).toHaveBeenNthCalledWith(4, 'COMMIT')
        expect(open).toHaveBeenCalledTimes(1)
    })

    test('treats a missing count result as unreferenced', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [] }) // SELECT COUNT
            .mockResolvedValueOnce({}) // DELETE
            .mockResolvedValueOnce({}) // COMMIT

        await expect(deletePrice(5)).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenCalledTimes(4)
    })

    test('rolls back when the delete fails', async () => {
        executeAsync
            .mockResolvedValueOnce({}) // BEGIN IMMEDIATE
            .mockResolvedValueOnce({ results: [{ count: 0 }] }) // SELECT COUNT
            .mockRejectedValueOnce(new Error('disk error')) // DELETE
            .mockResolvedValueOnce({}) // ROLLBACK

        await expect(deletePrice(5)).rejects.toThrow('Failed to delete price')
        expect(executeAsync).toHaveBeenNthCalledWith(4, 'ROLLBACK')
    })
})
