import {
    countSellers,
    createSeller,
    deleteSeller,
    fetchSellerBalanceById,
    fetchSellerById,
    fetchSellerStatById,
    fetchSellers,
    fetchSellersPage,
    initializeSellers,
    updateSeller,
    type SellerStatDetail,
    type SellersCursor,
    type SellersPage,
} from '../database/sellers'
import { ISeller, ISellerPaymentStat } from '../types/database'

export type NewSeller = Omit<ISeller, 'id'>
export type { SellerStatDetail, SellersCursor, SellersPage }

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

    /**
     * Purchase aggregate (count + total) for a single seller, without loading
     * every seller's stats.
     */
    async getSellerStatById(sellerId: number): Promise<SellerStatDetail | null> {
        await initializeSellers()
        return fetchSellerStatById(sellerId)
    }

    /** Owed / paid / balance summary for a single seller. */
    async getSellerBalanceById(sellerId: number): Promise<ISellerPaymentStat | null> {
        await initializeSellers()
        return fetchSellerBalanceById(sellerId)
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
