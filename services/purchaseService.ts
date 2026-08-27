import {
    countPurchases,
    createPurchase,
    fetchPurchases,
    fetchPurchasesPaginated,
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

    async getPurchasesPaginated(page: number, pageSize: number): Promise<{ items: IPurchaseWithSeller[]; total: number; hasMore: boolean }> {
        await initializeSellers()
        await initializePurchases()
        const offset = page * pageSize
        const [items, total] = await Promise.all([
            fetchPurchasesPaginated({ limit: pageSize, offset }),
            countPurchases(),
        ])
        return { items, total, hasMore: offset + items.length < total }
    }

    async recordPurchase(data: NewPurchase): Promise<number> {
        return createPurchase(data)
    }
}

export const purchaseService = new PurchaseService()
