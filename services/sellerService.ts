import {
    createSeller,
    deleteSeller,
    fetchSellers,
    initializeSellers,
    updateSeller,
    ISeller,
} from '../database'

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
        return createSeller(data)
    }

    async editSeller(id: number, data: Partial<NewSeller>): Promise<void> {
        await updateSeller(id, data)
    }

    async removeSeller(id: number): Promise<void> {
        await deleteSeller(id)
    }
}

export const sellerService = new SellerService()
