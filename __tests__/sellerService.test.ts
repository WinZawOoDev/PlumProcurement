import { sellerService } from '../services/sellerService'
import {
    createSeller,
    deleteSeller,
    fetchSellers,
    initializeSellers,
    updateSeller,
} from '../database/sellers'
import { ISeller } from '../types/database'

jest.mock('../database/sellers', () => ({
    initializeSellers: jest.fn(),
    fetchSellers: jest.fn(),
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
