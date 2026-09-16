import { open } from 'react-native-nitro-sqlite'
import { createPrice, updatePrice } from '../database/prices'
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

const uniqueError = () =>
    new Error('UNIQUE constraint failed: prices.category, prices.unit, prices.price')

describe('price uniqueness', () => {
    test('createPrice rejects when an identical price already exists', async () => {
        executeAsync.mockResolvedValueOnce({ results: [{ id: 7 }] }) // duplicate SELECT

        await expect(
            createPrice({ price: 5, unit: 'CUP', category: 'fruit' })
        ).rejects.toThrow(MESSAGES.ERROR_PRICE_EXISTS)
        // The INSERT must not be attempted once a duplicate is found.
        expect(executeAsync).toHaveBeenCalledTimes(1)
        expect(executeAsync).toHaveBeenCalledWith(
            expect.stringContaining('SELECT id FROM prices WHERE category IS ?'),
            ['fruit', 'CUP', 5]
        )
    })

    test('createPrice surfaces a duplicate-price error from the unique index', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] }) // no app-level duplicate
            .mockRejectedValueOnce(uniqueError()) // INSERT collides at the index

        await expect(
            createPrice({ price: 5, unit: 'CUP', category: 'fruit' })
        ).rejects.toThrow(MESSAGES.ERROR_PRICE_EXISTS)
    })

    test('createPrice still returns the insert id when the row is unique', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] }) // no duplicate
            .mockResolvedValueOnce({ insertId: 3 })

        await expect(
            createPrice({ price: 5, unit: 'CUP', category: 'fruit' })
        ).resolves.toBe(3)
    })

    test('updatePrice rejects when the merged row matches another price', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [{ category: 'fruit', unit: 'CUP', price: 5 }] })
            .mockResolvedValueOnce({ results: [{ id: 9 }] }) // duplicate SELECT

        await expect(updatePrice(1, { price: 5 })).rejects.toThrow(
            MESSAGES.ERROR_PRICE_EXISTS
        )
    })

    test('updatePrice surfaces a duplicate-price error from the unique index', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] }) // row not found -> no app-level guard
            .mockRejectedValueOnce(uniqueError()) // UPDATE collides at the index

        await expect(updatePrice(1, { price: 5 })).rejects.toThrow(MESSAGES.ERROR_PRICE_EXISTS)
    })
})
