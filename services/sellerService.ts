import {
    countSellers,
    createSeller,
    deleteSeller,
    fetchSellerById,
    fetchSellers,
    fetchSellersPage,
    initializeSellers,
    updateSeller,
    type SellersCursor,
    type SellersPage,
} from '../database/sellers'
import { ISeller } from '../types/database'

export type NewSeller = Omit<ISeller, 'id'>
export type { SellersCursor, SellersPage }

/**
 * Abstraction layer over the sellers database.
 * Components depend on this service instead of importing database.ts directly.
 */
export class SellerService {
    async getSellers(): Promise<ISeller[]> {
        await initializeSellers()
        return fetchSellers()
    }

    /**
     * Keyset-paginated sellers (name ASC) with stats + balance rolled in.
     * `cursor` is the previous page's `nextCursor`; `query` filters by
     * name/phone.
     */
    async getSellersPage(options: { limit: number; cursor?: SellersCursor; query?: string }): Promise<SellersPage> {
        await initializeSellers()
        return fetchSellersPage(options)
    }

    async getSellerCount(query?: string): Promise<number> {
        await initializeSellers()
        return countSellers(query)
    }

    async getSellerById(id: number): Promise<ISeller | null> {
        await initializeSellers()
        return fetchSellerById(id)
    }

    async addSeller(data: NewSeller): Promise<number> {
        await initializeSellers()
        return createSeller(data)
    }

    async editSeller(id: number, data: Partial<NewSeller>): Promise<void> {
        await initializeSellers()
        await updateSeller(id, data)
    }

    async removeSeller(id: number): Promise<void> {
        await initializeSellers()
        await deleteSeller(id)
    }
}

export const sellerService = new SellerService()
