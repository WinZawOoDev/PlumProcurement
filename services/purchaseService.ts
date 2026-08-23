import {
    createPurchase,
    fetchPurchases,
    initializePurchases,
    initializeSellers,
    IPurchaseWithSeller,
} from '../database'

export type NewPurchase = Omit<IPurchaseWithSeller, 'id' | 'seller_name'>

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

    async recordPurchase(data: NewPurchase): Promise<number> {
        return createPurchase(data)
    }
}

export const purchaseService = new PurchaseService()
