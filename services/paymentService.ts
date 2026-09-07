import {
    createPayment,
    deletePayment,
    fetchPaymentSummaries,
    fetchPaymentsBySeller,
    fetchSellerPaymentStat,
    initializePayments,
    updatePayment,
} from '../database/payments'
import { initializeSellers } from '../database/sellers'
import { IPayment, ISellerPaymentStat } from '../types/database'

export type NewPayment = Omit<IPayment, 'id'>
export type PaymentUpdates = { amount?: number; method?: string | null; note?: string | null }

/**
 * Abstraction layer over the payments database.
 * Payments settle what a seller is owed for their sold plums.
 */
export class PaymentService {
    async getPaymentsBySeller(sellerId: number): Promise<IPayment[]> {
        await initializeSellers()
        await initializePayments()
        return fetchPaymentsBySeller(sellerId)
    }

    async getPaymentSummaries(): Promise<ISellerPaymentStat[]> {
        await initializeSellers()
        await initializePayments()
        return fetchPaymentSummaries()
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
