import {
    createPayment,
    deletePayment,
    fetchPaymentSummaries,
    fetchPaymentsPage,
    fetchRecentPaymentsBySeller,
    fetchSellerPaymentStat,
    initializePayments,
    updatePayment,
    type PaymentsPage,
} from '../database/payments'
import { initializeSellers } from '../database/sellers'
import { IPayment, ISellerPaymentStat } from '../types/database'

export type NewPayment = Omit<IPayment, 'id'>
export type PaymentUpdates = { amount?: number; method?: string | null; note?: string | null }
export type { PaymentsPage }

/**
 * Abstraction layer over the payments database.
 * Payments settle what a seller is owed for their sold plums.
 */
export class PaymentService {
    /**
     * Keyset pagination over one seller's payments (id DESC). Pass the previous
     * page's `nextCursor` as `cursor`; undefined for the first page.
     */
    async getPaymentsPageBySeller(options: { sellerId: number; limit: number; cursor?: number }): Promise<PaymentsPage> {
        await initializeSellers()
        await initializePayments()
        return fetchPaymentsPage(options)
    }

    /** Most recent payments for one seller, bounded by `limit`. */
    async getRecentPaymentsBySeller(sellerId: number, limit = 3): Promise<IPayment[]> {
        await initializeSellers()
        await initializePayments()
        return fetchRecentPaymentsBySeller(sellerId, limit)
    }

    async getPaymentSummaries(): Promise<ISellerPaymentStat[]> {
        await initializeSellers()
        await initializePayments()
        return fetchPaymentSummaries()
    }

    /** IDs of sellers with at least one recorded payment. */
    async getPaidSellerIds(): Promise<number[]> {
        const summaries = await this.getPaymentSummaries()
        return summaries.filter((s) => s.total_paid > 0).map((s) => s.seller_id)
    }

    async getSellerPaymentStat(sellerId: number): Promise<ISellerPaymentStat | null> {
        await initializeSellers()
        await initializePayments()
        return fetchSellerPaymentStat(sellerId)
    }

    async recordPayment(data: NewPayment): Promise<number> {
        await initializeSellers()
        await initializePayments()
        return createPayment(data)
    }

    async editPayment(id: number, updates: PaymentUpdates): Promise<void> {
        await initializeSellers()
        await initializePayments()
        await updatePayment(id, updates)
    }

    async removePayment(id: number): Promise<void> {
        await initializeSellers()
        await initializePayments()
        await deletePayment(id)
    }
}

export const paymentService = new PaymentService()
