import { purchaseService } from '../services/purchaseService'
import {
    createPurchase,
    fetchPurchases,
    initializePurchases,
    IPurchase,
} from '../database'

jest.mock('../database', () => ({
    initializePurchases: jest.fn(),
    fetchPurchases: jest.fn(),
    createPurchase: jest.fn(),
}))

const mockPurchases: IPurchase[] = [
    {
        id: 1,
        price_id: 10,
        category: 'fruits',
        unit: 'PER KG',
        unit_price: 3000,
        quantity: 2,
        total: 6000,
    },
]

beforeEach(() => {
    jest.clearAllMocks()
})

describe('PurchaseService.getPurchases', () => {
    test('initializes table then fetches purchases', async () => {
        ;(initializePurchases as jest.Mock).mockResolvedValue(undefined)
        ;(fetchPurchases as jest.Mock).mockResolvedValue(mockPurchases)

        const result = await purchaseService.getPurchases()

        expect(initializePurchases).toHaveBeenCalledTimes(1)
        expect(fetchPurchases).toHaveBeenCalledTimes(1)
        expect(result).toEqual(mockPurchases)
    })
})

describe('PurchaseService.recordPurchase', () => {
    test('delegates to createPurchase and returns insert id', async () => {
        ;(createPurchase as jest.Mock).mockResolvedValue(7)

        const data = {
            price_id: 10,
            category: 'fruits',
            unit: 'PER KG',
            unit_price: 3000,
            quantity: 2,
            total: 6000,
        }
        const id = await purchaseService.recordPurchase(data)

        expect(createPurchase).toHaveBeenCalledWith(data)
        expect(id).toBe(7)
    })

    test('propagates validation errors from createPurchase', async () => {
        ;(createPurchase as jest.Mock).mockRejectedValue(
            new Error('Invalid input. Please check your data.')
        )

        await expect(
            purchaseService.recordPurchase({
                price_id: 10,
                category: 'fruits',
                unit: 'PER KG',
                unit_price: 3000,
                quantity: 0,
                total: 0,
            })
        ).rejects.toThrow('Invalid input. Please check your data.')
    })
})
