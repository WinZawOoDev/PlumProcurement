import {
    createPrice,
    deletePrice,
    fetchPrices,
    initializePrices,
    updatePrice,
} from '../database/prices'
import { IPrice } from '../types/database'

export type NewPrice = Omit<IPrice, 'id'>

/**
 * Abstraction layer over the prices database.
 * Components depend on this service instead of importing database.ts directly.
 */
export class PriceService {
    async getPrices(): Promise<IPrice[]> {
        await initializePrices()
        return fetchPrices()
    }

    async addPrice(data: NewPrice): Promise<number> {
        return createPrice(data)
    }

    async editPrice(id: number, data: Partial<NewPrice>): Promise<void> {
        await updatePrice(id, data)
    }

    async removePrice(id: number): Promise<void> {
        await deletePrice(id)
    }
}

export const priceService = new PriceService()
