import { purchaseService } from '../services/purchaseService'
import {
    createPurchase,
    deletePurchase,
    fetchPurchases,
    fetchPurchasesBySeller,
    fetchPurchasesPage,
    fetchSellerStats,
    initializePurchases,
    updatePurchase,
} from '../database/purchases'
import { initializeSellers } from '../database/sellers'
import { IPurchaseWithSeller } from '../types/database'

jest.mock('../database/purchases', () => ({
    initializePurchases: jest.fn(),
    fetchPurchases: jest.fn(),
    fetchPurchasesPage: jest.fn(),
    createPurchase: jest.fn(),
    updatePurchase: jest.fn(),
    deletePurchase: jest.fn(),
    fetchSellerStats: jest.fn(),
    fetchPurchasesBySeller: jest.fn(),
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

describe('PurchaseService.getPurchasesPage', () => {
    test('fetches a page and returns the service response as-is', async () => {
        const page = { items: mockPurchases, nextCursor: 5 }
        ;(fetchPurchasesPage as jest.Mock).mockResolvedValue(page)
        ;(initializePurchases as jest.Mock).mockResolvedValue(undefined)
        ;(initializeSellers as jest.Mock).mockResolvedValue(undefined)

        const result = await purchaseService.getPurchasesPage({ limit: 20 })

        expect(fetchPurchasesPage).toHaveBeenCalledWith({ limit: 20, cursor: undefined, query: undefined })
        expect(initializePurchases).toHaveBeenCalledTimes(1)
        expect(initializeSellers).toHaveBeenCalledTimes(1)
        expect(result).toEqual(page)
    })

    test('passes cursor and query through to the database layer', async () => {
        ;(fetchPurchasesPage as jest.Mock).mockResolvedValue({ items: [], nextCursor: null })

        await purchaseService.getPurchasesPage({ limit: 20, cursor: 5, query: 'fruit' })

        expect(fetchPurchasesPage).toHaveBeenCalledWith({ limit: 20, cursor: 5, query: 'fruit' })
    })
})

describe('PurchaseService.editPurchase', () => {
    test('delegates to updatePurchase', async () => {
        ;(updatePurchase as jest.Mock).mockResolvedValue(undefined)

        await expect(
            purchaseService.editPurchase(3, { quantity: 4, seller_id: null })
        ).resolves.toBeUndefined()

        expect(updatePurchase).toHaveBeenCalledWith(3, { quantity: 4, seller_id: null })
    })

    test('propagates validation errors from updatePurchase', async () => {
        ;(updatePurchase as jest.Mock).mockRejectedValue(new Error('bad quantity'))
        await expect(purchaseService.editPurchase(3, { quantity: 0 })).rejects.toThrow('bad quantity')
    })
})

describe('PurchaseService.removePurchase', () => {
    test('delegates to deletePurchase', async () => {
        ;(deletePurchase as jest.Mock).mockResolvedValue(undefined)
        await expect(purchaseService.removePurchase(9)).resolves.toBeUndefined()
        expect(deletePurchase).toHaveBeenCalledWith(9)
    })
})

describe('PurchaseService.getSellerStats', () => {
    test('initializes then returns aggregated stats', async () => {
        const stats = [{ seller_id: 2, purchase_count: 5, total_spent: 1200 }]
        ;(initializePurchases as jest.Mock).mockResolvedValue(undefined)
        ;(fetchSellerStats as jest.Mock).mockResolvedValue(stats)

        await expect(purchaseService.getSellerStats()).resolves.toEqual(stats)
        expect(initializePurchases).toHaveBeenCalledTimes(1)
        expect(fetchSellerStats).toHaveBeenCalledTimes(1)
    })
})

describe('PurchaseService.getPurchasesBySeller', () => {
    test('initializes then fetches purchases filtered by seller', async () => {
        ;(initializePurchases as jest.Mock).mockResolvedValue(undefined)
        ;(fetchPurchasesBySeller as jest.Mock).mockResolvedValue(mockPurchases)

        await expect(purchaseService.getPurchasesBySeller(2)).resolves.toEqual(mockPurchases)
        expect(fetchPurchasesBySeller).toHaveBeenCalledWith(2)
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
