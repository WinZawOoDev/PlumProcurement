import { purchaseService } from '../services/purchaseService'
import {
    countPurchases,
    createPurchase,
    deletePurchase,
    fetchPurchasesPage,
    fetchRecentPurchases,
    fetchRecentPurchasesBySeller,
    fetchSellerStats,
    initializePurchases,
    updatePurchase,
} from '../database/purchases'
import { initializeSellers } from '../database/sellers'
import { IPurchaseDetail } from '../types/database'

jest.mock('../database/purchases', () => ({
    initializePurchases: jest.fn(),
    fetchRecentPurchases: jest.fn(),
    fetchPurchasesPage: jest.fn(),
    countPurchases: jest.fn(),
    createPurchase: jest.fn(),
    updatePurchase: jest.fn(),
    deletePurchase: jest.fn(),
    fetchSellerStats: jest.fn(),
    fetchRecentPurchasesBySeller: jest.fn(),
}))

jest.mock('../database/sellers', () => ({
    initializeSellers: jest.fn(),
}))

const mockPurchases: IPurchaseDetail[] = [
    {
        id: 1,
        seller_id: null,
        total: 6000,
        seller_name: null,
        items: [
            {
                id: 11,
                purchase_id: 1,
                price_id: 10,
                category: 'fruits',
                unit: 'PER KG',
                unit_price: 3000,
                quantity: 2,
                line_total: 6000,
            },
        ],
    },
]

beforeEach(() => {
    jest.clearAllMocks()
})

describe('PurchaseService.getRecentPurchases', () => {
    test('initializes tables then fetches a bounded recent page', async () => {
        ;(initializePurchases as jest.Mock).mockResolvedValue(undefined)
        ;(initializeSellers as jest.Mock).mockResolvedValue(undefined)
        ;(fetchRecentPurchases as jest.Mock).mockResolvedValue(mockPurchases)

        const result = await purchaseService.getRecentPurchases(4)

        expect(initializePurchases).toHaveBeenCalledTimes(1)
        expect(initializeSellers).toHaveBeenCalledTimes(1)
        expect(fetchRecentPurchases).toHaveBeenCalledWith(4)
        expect(result).toEqual(mockPurchases)
    })
})

describe('PurchaseService.getPurchaseCount', () => {
    test('initializes tables then returns the total count', async () => {
        ;(initializePurchases as jest.Mock).mockResolvedValue(undefined)
        ;(initializeSellers as jest.Mock).mockResolvedValue(undefined)
        ;(countPurchases as jest.Mock).mockResolvedValue(12)

        await expect(purchaseService.getPurchaseCount()).resolves.toBe(12)
        expect(countPurchases).toHaveBeenCalledWith(undefined)
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

    test('passes sellerId through to the database layer', async () => {
        ;(fetchPurchasesPage as jest.Mock).mockResolvedValue({ items: [], nextCursor: null })

        await purchaseService.getPurchasesPage({ limit: 20, sellerId: 2 })

        expect(fetchPurchasesPage).toHaveBeenCalledWith({ limit: 20, sellerId: 2 })
    })
})

describe('PurchaseService.editPurchase', () => {
    test('delegates to updatePurchase', async () => {
        ;(updatePurchase as jest.Mock).mockResolvedValue(undefined)

        const items = [{ price_id: 10, category: 'fruits', unit: 'PER KG', unit_price: 3000, quantity: 4 }]
        await expect(purchaseService.editPurchase(3, { items })).resolves.toBeUndefined()

        expect(updatePurchase).toHaveBeenCalledWith(3, { items })
    })

    test('propagates validation errors from updatePurchase', async () => {
        ;(updatePurchase as jest.Mock).mockRejectedValue(new Error('bad quantity'))
        await expect(purchaseService.editPurchase(3, { items: [] })).rejects.toThrow('bad quantity')
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

describe('PurchaseService.getRecentPurchasesBySeller', () => {
    test('initializes then fetches a bounded recent page filtered by seller', async () => {
        ;(initializePurchases as jest.Mock).mockResolvedValue(undefined)
        ;(fetchRecentPurchasesBySeller as jest.Mock).mockResolvedValue(mockPurchases)

        await expect(purchaseService.getRecentPurchasesBySeller(2, 3)).resolves.toEqual(mockPurchases)
        expect(fetchRecentPurchasesBySeller).toHaveBeenCalledWith(2, 3)
    })
})

describe('PurchaseService.recordPurchase', () => {
    test('delegates to createPurchase and returns insert id', async () => {
        ;(createPurchase as jest.Mock).mockResolvedValue(7)

        const data = {
            seller_id: null,
            items: [{ price_id: 10, category: 'fruits', unit: 'PER KG', unit_price: 3000, quantity: 2 }],
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
            purchaseService.recordPurchase({ seller_id: null, items: [] })
        ).rejects.toThrow('Invalid input. Please check your data.')
    })
})
