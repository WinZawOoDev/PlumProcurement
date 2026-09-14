import { open } from 'react-native-nitro-sqlite'
import { deletePrice } from '../database/prices'
import { __resetDbForTests } from '../database/connection'

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

describe('deletePrice referential guard', () => {
    test('blocks deletion when purchases reference the price (no delete issued)', async () => {
        executeAsync.mockResolvedValueOnce({ results: [{ count: 3 }] }) // SELECT COUNT

        await expect(deletePrice(5)).rejects.toThrow(
            'Cannot delete this price because purchases reference it.'
        )
        expect(transaction).toHaveBeenCalledTimes(1)
        expect(executeAsync).toHaveBeenCalledTimes(1)
        expect(executeAsync).toHaveBeenCalledWith(
            expect.stringContaining('SELECT COUNT(*) AS count FROM purchase_items'),
            [5]
        )
        expect(executeAsync).not.toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM prices'),
            expect.anything()
        )
        expect(open).toHaveBeenCalledTimes(1)
    })

    test('deletes the price when it has no purchases (commits)', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [{ count: 0 }] }) // SELECT COUNT
            .mockResolvedValueOnce({}) // DELETE

        await expect(deletePrice(5)).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenCalledTimes(2)
        expect(executeAsync).toHaveBeenLastCalledWith(
            'DELETE FROM prices WHERE id = ?',
            [5]
        )
    })

    test('treats a missing count result as unreferenced', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] }) // SELECT COUNT
            .mockResolvedValueOnce({}) // DELETE

        await expect(deletePrice(5)).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenCalledTimes(2)
    })

    test('surfaces a delete failure (the library rolls the transaction back)', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [{ count: 0 }] }) // SELECT COUNT
            .mockRejectedValueOnce(new Error('disk error')) // DELETE

        await expect(deletePrice(5)).rejects.toThrow('Failed to delete price')
    })
})
