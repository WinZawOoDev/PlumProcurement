import {
    countPurchases,
    createPurchase,
    deletePurchase,
    fetchPurchases,
    fetchPurchasesBySeller,
    fetchPurchasesPaginated,
    fetchSellerStats,
    initializePurchases,
    updatePurchase,
} from '../database/purchases'
import { initializeSellers } from '../database/sellers'
import { IPurchaseWithSeller, ISellerStat } from '../types/database'

export type NewPurchase = Omit<IPurchaseWithSeller, 'id' | 'seller_name'>
export type PurchaseUpdates = { quantity?: number; seller_id?: number | null }

/**
 * Abstraction layer over the purchases database.
 * Components depend on this service instead of importing database.ts directly.
 */
export class PurchaseService {
    async getPurchases(): Promise<IPurchaseWithSeller[]> {
        await initializeSellers()
        await initializePurchases()
        return fetchPurchases()
    }

    async getPurchasesPaginated(page: number, pageSize: number, query?: string): Promise<{ items: IPurchaseWithSeller[]; total: number; hasMore: boolean }> {
        await initializeSellers()
        await initializePurchases()
        const offset = page * pageSize
        const [items, total] = await Promise.all([
            fetchPurchasesPaginated({ limit: pageSize, offset, query }),
            countPurchases(query),
        ])
        return { items, total, hasMore: offset + items.length < total }
    }

    async recordPurchase(data: NewPurchase): Promise<number> {
        return createPurchase(data)
    }

    async editPurchase(id: number, updates: PurchaseUpdates): Promise<void> {
        await updatePurchase(id, updates)
    }

    async removePurchase(id: number): Promise<void> {
        await deletePurchase(id)
    }

    async getSellerStats(): Promise<ISellerStat[]> {
        await initializePurchases()
        return fetchSellerStats()
    }

    async getPurchasesBySeller(sellerId: number): Promise<IPurchaseWithSeller[]> {
        await initializePurchases()
        return fetchPurchasesBySeller(sellerId)
    }
}

export const purchaseService = new PurchaseService()
