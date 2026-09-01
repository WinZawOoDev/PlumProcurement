import { priceService } from '../services/priceService'
import {
    initializePrices,
    fetchPrices,
    createPrice,
    updatePrice,
    deletePrice,
} from '../database/prices'
import { IPrice } from '../types/database'

jest.mock('../database/prices', () => ({
    initializePrices: jest.fn(),
    fetchPrices: jest.fn(),
    createPrice: jest.fn(),
    updatePrice: jest.fn(),
    deletePrice: jest.fn(),
}))

const mockPrices: IPrice[] = [
    { id: 1, price: 3000, unit: 'PER KG', category: 'fruits', is_available: true },
]

beforeEach(() => {
    jest.clearAllMocks()
})

describe('PriceService.getPrices', () => {
    test('initializes table then fetches prices', async () => {
        ;(initializePrices as jest.Mock).mockResolvedValue(undefined)
        ;(fetchPrices as jest.Mock).mockResolvedValue(mockPrices)

        const result = await priceService.getPrices()

        expect(initializePrices).toHaveBeenCalledTimes(1)
        expect(fetchPrices).toHaveBeenCalledTimes(1)
        expect(result).toEqual(mockPrices)
    })
})

describe('PriceService.addPrice', () => {
    test('delegates to createPrice and returns insert id', async () => {
        ;(createPrice as jest.Mock).mockResolvedValue(42)

        const data = { price: 100, unit: 'PER KG', category: 'grains', is_available: false }
        const id = await priceService.addPrice(data)

        expect(createPrice).toHaveBeenCalledWith(data)
        expect(id).toBe(42)
    })

    test('propagates errors from createPrice', async () => {
        ;(createPrice as jest.Mock).mockRejectedValue(new Error('Failed to create price'))

        await expect(
            priceService.addPrice({ price: 0, unit: 'PER KG', category: 'grains', is_available: false })
        ).rejects.toThrow('Failed to create price')
    })
})

describe('PriceService.editPrice', () => {
    test('delegates to updatePrice', async () => {
        ;(updatePrice as jest.Mock).mockResolvedValue(undefined)

        await priceService.editPrice(1, { price: 200 })

        expect(updatePrice).toHaveBeenCalledWith(1, { price: 200 })
    })
})

describe('PriceService.removePrice', () => {
    test('delegates to deletePrice', async () => {
        ;(deletePrice as jest.Mock).mockResolvedValue(undefined)

        await priceService.removePrice(7)

        expect(deletePrice).toHaveBeenCalledWith(7)
    })
})
