import {
    createPurchase,
    fetchPurchases,
    initializePurchases,
    IPurchase,
} from '../database'

export type NewPurchase = Omit<IPurchase, 'id'>

/**
 * Abstraction layer over the purchases database.
 * Components depend on this service instead of importing database.ts directly.
 */
export class PurchaseService {
    async getPurchases(): Promise<IPurchase[]> {
        await initializePurchases()
        return fetchPurchases()
    }

    async recordPurchase(data: NewPurchase): Promise<number> {
        return createPurchase(data)
    }
}

export const purchaseService = new PurchaseService()
