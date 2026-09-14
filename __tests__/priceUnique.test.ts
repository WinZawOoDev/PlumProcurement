import { open } from 'react-native-nitro-sqlite'
import { createPrice, updatePrice } from '../database/prices'
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

const uniqueError = () =>
    new Error('UNIQUE constraint failed: prices.category, prices.unit, prices.price')

describe('price uniqueness', () => {
    test('createPrice surfaces a duplicate-price error', async () => {
        executeAsync.mockRejectedValueOnce(uniqueError())

        await expect(
            createPrice({ price: 5, unit: 'CUP', category: 'fruit' })
        ).rejects.toThrow(MESSAGES.ERROR_PRICE_EXISTS)
    })

    test('updatePrice surfaces a duplicate-price error', async () => {
        executeAsync.mockRejectedValueOnce(uniqueError())

        await expect(updatePrice(1, { price: 5 })).rejects.toThrow(MESSAGES.ERROR_PRICE_EXISTS)
    })

    test('createPrice still returns the insert id when the row is unique', async () => {
        executeAsync.mockResolvedValueOnce({ insertId: 3 })

        await expect(
            createPrice({ price: 5, unit: 'CUP', category: 'fruit' })
        ).resolves.toBe(3)
    })
})
