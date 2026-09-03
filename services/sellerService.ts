import {
    createSeller,
    deleteSeller,
    fetchSellers,
    initializeSellers,
    updateSeller,
} from '../database/sellers'
import { ISeller } from '../types/database'

export type NewSeller = Omit<ISeller, 'id'>

/**
 * Abstraction layer over the sellers database.
 * Components depend on this service instead of importing database.ts directly.
 */
export class SellerService {
    async getSellers(): Promise<ISeller[]> {
        await initializeSellers()
        return fetchSellers()
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
