import { purchaseService } from '../services/purchaseService'
import {
    countPurchases,
    createPurchase,
    fetchPurchases,
    fetchPurchasesPaginated,
    initializePurchases,
} from '../database/purchases'
import { initializeSellers } from '../database/sellers'
import { IPurchaseWithSeller } from '../types/database'

jest.mock('../database/purchases', () => ({
    initializePurchases: jest.fn(),
    fetchPurchases: jest.fn(),
    fetchPurchasesPaginated: jest.fn(),
    countPurchases: jest.fn(),
    createPurchase: jest.fn(),
}))

jest.mock('../database/sellers', () => ({
    initializeSellers: jest.fn(),
}))

const mockPurchases: IPurchaseWithSeller[] = [
    {
        id: 1,
        price_id: 10,
        seller_id: null,
        category: 'fruits',
        unit: 'PER KG',
        unit_price: 3000,
        quantity: 2,
        total: 6000,
        seller_name: null,
    },
]

beforeEach(() => {
    jest.clearAllMocks()
})

describe('PurchaseService.getPurchases', () => {
    test('initializes tables then fetches purchases', async () => {
        ;(initializePurchases as jest.Mock).mockResolvedValue(undefined)
        ;(initializeSellers as jest.Mock).mockResolvedValue(undefined)
        ;(fetchPurchases as jest.Mock).mockResolvedValue(mockPurchases)

        const result = await purchaseService.getPurchases()

        expect(initializePurchases).toHaveBeenCalledTimes(1)
        expect(initializeSellers).toHaveBeenCalledTimes(1)
        expect(fetchPurchases).toHaveBeenCalledTimes(1)
        expect(result).toEqual(mockPurchases)
    })
})

describe('PurchaseService.getPurchasesPaginated', () => {
    test('fetches paginated purchases and computes hasMore', async () => {
        ;(fetchPurchasesPaginated as jest.Mock).mockResolvedValue(mockPurchases)
        ;(countPurchases as jest.Mock).mockResolvedValue(50)
        ;(initializePurchases as jest.Mock).mockResolvedValue(undefined)
        ;(initializeSellers as jest.Mock).mockResolvedValue(undefined)

        const result = await purchaseService.getPurchasesPaginated(0, 20)

        expect(fetchPurchasesPaginated).toHaveBeenCalledWith({ limit: 20, offset: 0 })
        expect(countPurchases).toHaveBeenCalledTimes(1)
        expect(result).toEqual({ items: mockPurchases, total: 50, hasMore: true })
    })

    test('hasMore false when last page', async () => {
        ;(fetchPurchasesPaginated as jest.Mock).mockResolvedValue(mockPurchases)
        ;(countPurchases as jest.Mock).mockResolvedValue(1)
        const result = await purchaseService.getPurchasesPaginated(0, 20)
        expect(result.hasMore).toBe(false)
    })
})

describe('PurchaseService.recordPurchase', () => {
    test('delegates to createPurchase and returns insert id', async () => {
        ;(createPurchase as jest.Mock).mockResolvedValue(7)

        const data = {
            price_id: 10,
            seller_id: null,
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
                seller_id: null,
                category: 'fruits',
                unit: 'PER KG',
                unit_price: 3000,
                quantity: 0,
                total: 0,
            })
        ).rejects.toThrow('Invalid input. Please check your data.')
    })
})
