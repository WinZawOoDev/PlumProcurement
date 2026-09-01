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
    test('blocks deletion when purchases reference the price', async () => {
        executeAsync.mockResolvedValueOnce({ results: [{ count: 3 }] })

        await expect(deletePrice(5)).rejects.toThrow(
            'Cannot delete this price because purchases reference it.'
        )
        expect(executeAsync).toHaveBeenCalledTimes(1)
        expect(open).toHaveBeenCalledTimes(1)
    })

    test('deletes the price when it has no purchases', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [{ count: 0 }] })
            .mockResolvedValueOnce({})

        await expect(deletePrice(5)).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenCalledTimes(2)
        expect(open).toHaveBeenCalledTimes(1)
    })

    test('treats a missing count result as unreferenced', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] })
            .mockResolvedValueOnce({})

        await expect(deletePrice(5)).resolves.toBeUndefined()
        expect(executeAsync).toHaveBeenCalledTimes(2)
    })
})
