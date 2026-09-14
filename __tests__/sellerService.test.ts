import { sellerService } from '../services/sellerService'
import {
    countSellers,
    createSeller,
    deleteSeller,
    fetchSellers,
    fetchSellersPage,
    initializeSellers,
    updateSeller,
} from '../database/sellers'
import { ISeller, ISellerWithStats } from '../types/database'

jest.mock('../database/sellers', () => ({
    initializeSellers: jest.fn(),
    fetchSellers: jest.fn(),
    fetchSellersPage: jest.fn(),
    countSellers: jest.fn(),
    createSeller: jest.fn(),
    updateSeller: jest.fn(),
    deleteSeller: jest.fn(),
}))

const mockSellers: ISeller[] = [
    { id: 1, name: 'U Ba', phone: '09-123-456-789', address: null },
]

beforeEach(() => {
    jest.clearAllMocks()
})

describe('SellerService.getSellers', () => {
    test('initializes table then fetches sellers', async () => {
        ;(initializeSellers as jest.Mock).mockResolvedValue(undefined)
        ;(fetchSellers as jest.Mock).mockResolvedValue(mockSellers)

        const result = await sellerService.getSellers()

        expect(initializeSellers).toHaveBeenCalledTimes(1)
        expect(fetchSellers).toHaveBeenCalledTimes(1)
        expect(result).toEqual(mockSellers)
    })
})

describe('SellerService paginated search', () => {
    const page: { items: ISellerWithStats[]; nextCursor: { name: string; id: number } | null } = {
        items: [
            {
                id: 2,
                name: 'Daw Mya',
                phone: null,
                address: null,
                purchase_count: 3,
                total_spent: 30,
                balance: 10,
            },
        ],
        nextCursor: null,
    }

    test('initializes then returns a seller page with stats + balance', async () => {
        ;(initializeSellers as jest.Mock).mockResolvedValue(undefined)
        ;(fetchSellersPage as jest.Mock).mockResolvedValue(page)

        const result = await sellerService.getSellersPage({ limit: 20, query: 'mya' })

        expect(initializeSellers).toHaveBeenCalledTimes(1)
        expect(fetchSellersPage).toHaveBeenCalledWith({ limit: 20, query: 'mya' })
        expect(result).toEqual(page)
    })

    test('passes the keyset cursor through', async () => {
        ;(fetchSellersPage as jest.Mock).mockResolvedValue({ items: [], nextCursor: null })
        const cursor = { name: 'U Ba', id: 1 }

        await sellerService.getSellersPage({ limit: 20, cursor })

        expect(fetchSellersPage).toHaveBeenCalledWith({ limit: 20, cursor })
    })

    test('getSellerCount initializes then counts matches', async () => {
        ;(initializeSellers as jest.Mock).mockResolvedValue(undefined)
        ;(countSellers as jest.Mock).mockResolvedValue(7)

        await expect(sellerService.getSellerCount('ba')).resolves.toBe(7)
        expect(countSellers).toHaveBeenCalledWith('ba')
    })
})

describe('SellerService.addSeller', () => {
    test('delegates to createSeller and returns insert id', async () => {
        ;(createSeller as jest.Mock).mockResolvedValue(9)

        const data = { name: 'U Ba', phone: null, address: null }
        const id = await sellerService.addSeller(data)

        expect(createSeller).toHaveBeenCalledWith(data)
        expect(id).toBe(9)
    })

    test('propagates errors from createSeller', async () => {
        ;(createSeller as jest.Mock).mockRejectedValue(new Error('Failed to create seller'))

        await expect(sellerService.addSeller({ name: '', phone: null, address: null })).rejects.toThrow(
            'Failed to create seller'
        )
    })
})

describe('SellerService.editSeller', () => {
    test('delegates to updateSeller', async () => {
        ;(updateSeller as jest.Mock).mockResolvedValue(undefined)

        await sellerService.editSeller(1, { name: 'U Kyaw' })

        expect(updateSeller).toHaveBeenCalledWith(1, { name: 'U Kyaw' })
    })
})

describe('SellerService.removeSeller', () => {
    test('delegates to deleteSeller', async () => {
        ;(deleteSeller as jest.Mock).mockResolvedValue(undefined)

        await sellerService.removeSeller(3)

        expect(deleteSeller).toHaveBeenCalledWith(3)
    })
})
