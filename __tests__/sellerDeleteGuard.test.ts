import { open } from 'react-native-nitro-sqlite'
import { deleteSeller } from '../database/sellers'
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

describe('deleteSeller referential guard', () => {
    test('blocks deletion when purchases reference the seller (no delete issued)', async () => {
        executeAsync.mockResolvedValueOnce({ results: [{ count: 2 }] }) // SELECT COUNT purchases

        await expect(deleteSeller(5)).rejects.toThrow(
            'Cannot delete this seller because purchases reference it.'
        )
        expect(transportCalls()).toEqual([])
        expect(open).toHaveBeenCalledTimes(1)
    })

    test('blocks deletion when payments reference the seller (no delete issued)', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [{ count: 0 }] }) // SELECT COUNT purchases
            .mockResolvedValueOnce({ results: [{ count: 2 }] }) // SELECT COUNT payments

        await expect(deleteSeller(5)).rejects.toThrow(
            'Cannot delete this seller because payments reference it.'
        )
        expect(transportCalls()).toEqual([])
    })

    test('deletes the seller when it has no purchases or payments (commits)', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [{ count: 0 }] }) // SELECT COUNT purchases
            .mockResolvedValueOnce({ results: [{ count: 0 }] }) // SELECT COUNT payments
            .mockResolvedValueOnce({}) // DELETE

        await expect(deleteSeller(5)).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenLastCalledWith(
            'DELETE FROM sellers WHERE id = ?',
            [5]
        )
        expect(open).toHaveBeenCalledTimes(1)
    })

    test('surfaces a delete failure (the library rolls the transaction back)', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [{ count: 0 }] }) // SELECT COUNT purchases
            .mockResolvedValueOnce({ results: [{ count: 0 }] }) // SELECT COUNT payments
            .mockRejectedValueOnce(new Error('disk error')) // DELETE

        await expect(deleteSeller(5)).rejects.toThrow('Failed to delete seller')
    })
})

function transportCalls() {
    return executeAsync.mock.calls.filter(([sql]) => String(sql).startsWith('DELETE'))
}
