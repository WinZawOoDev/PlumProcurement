import {
    createPurchase,
    deletePurchase,
    fetchPurchases,
    fetchPurchasesBySeller,
    fetchPurchasesPage,
    fetchSellerStats,
    initializePurchases,
    updatePurchase,
    type NewPurchase,
    type NewPurchaseItem,
    type PurchaseUpdates,
    type PurchasesPage,
} from '../database/purchases'
import { initializeSellers } from '../database/sellers'
import { IPurchaseDetail, ISellerStat } from '../types/database'

export type { NewPurchase, NewPurchaseItem, PurchaseUpdates, PurchasesPage }

/**
 * Abstraction layer over the purchases database.
 * Components depend on this service instead of importing database.ts directly.
 */
export class PurchaseService {
    async getPurchases(): Promise<IPurchaseDetail[]> {
        await initializeSellers()
        await initializePurchases()
        return fetchPurchases()
    }

    /**
     * Keyset pagination: pass the previous page's `nextCursor` as `cursor`
     * (undefined for the first page). Query filters by seller name or item
     * category/unit.
     */
    async getPurchasesPage(options: { limit: number; cursor?: number; query?: string }): Promise<PurchasesPage> {
        await initializeSellers()
        await initializePurchases()
        return fetchPurchasesPage(options)
    }

    async recordPurchase(data: NewPurchase): Promise<number> {
        await initializeSellers()
        await initializePurchases()
        return createPurchase(data)
    }

    async editPurchase(id: number, updates: PurchaseUpdates): Promise<void> {
        await initializeSellers()
        await initializePurchases()
        await updatePurchase(id, updates)
    }

    async removePurchase(id: number): Promise<void> {
        await initializeSellers()
        await initializePurchases()
        await deletePurchase(id)
    }

    async getSellerStats(): Promise<ISellerStat[]> {
        await initializeSellers()
        await initializePurchases()
        return fetchSellerStats()
    }

    async getPurchasesBySeller(sellerId: number): Promise<IPurchaseDetail[]> {
        await initializeSellers()
        await initializePurchases()
        return fetchPurchasesBySeller(sellerId)
    }
}

export const purchaseService = new PurchaseService()
