import { paymentService } from '../services/paymentService'
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
import { ISellerPaymentStat } from '../types/database'

jest.mock('../database/payments', () => ({
    initializePayments: jest.fn(),
    fetchPaymentsBySeller: jest.fn(),
    fetchPaymentSummaries: jest.fn(),
    fetchSellerPaymentStat: jest.fn(),
    createPayment: jest.fn(),
    updatePayment: jest.fn(),
    deletePayment: jest.fn(),
}))

jest.mock('../database/sellers', () => ({
    initializeSellers: jest.fn(),
}))

const stat: ISellerPaymentStat = {
    seller_id: 2,
    seller_name: 'U Ba',
    total_owed: 100,
    total_paid: 40,
    balance: 60,
}

beforeEach(() => {
    jest.clearAllMocks()
    ;(initializePayments as jest.Mock).mockResolvedValue(undefined)
    ;(initializeSellers as jest.Mock).mockResolvedValue(undefined)
})

describe('PaymentService.getPaymentsBySeller', () => {
    test('initializes then fetches payments for a seller', async () => {
        const payments = [{ id: 1, seller_id: 2, purchase_id: null, amount: 40, method: 'cash', note: null }]
        ;(fetchPaymentsBySeller as jest.Mock).mockResolvedValue(payments)

        await expect(paymentService.getPaymentsBySeller(2)).resolves.toEqual(payments)
        expect(initializePayments).toHaveBeenCalledTimes(1)
        expect(fetchPaymentsBySeller).toHaveBeenCalledWith(2)
    })
})

describe('PaymentService.getSellerPaymentStat', () => {
    test('initializes then fetches the stat for a seller', async () => {
        ;(fetchSellerPaymentStat as jest.Mock).mockResolvedValue(stat)

        await expect(paymentService.getSellerPaymentStat(2)).resolves.toEqual(stat)
        expect(fetchSellerPaymentStat).toHaveBeenCalledWith(2)
    })
})

describe('PaymentService.getPaymentSummaries', () => {
    test('initializes then returns summaries', async () => {
        ;(fetchPaymentSummaries as jest.Mock).mockResolvedValue([stat])

        await expect(paymentService.getPaymentSummaries()).resolves.toEqual([stat])
        expect(fetchPaymentSummaries).toHaveBeenCalledTimes(1)
    })
})

describe('PaymentService.recordPayment', () => {
    test('delegates to createPayment and returns insert id', async () => {
        ;(createPayment as jest.Mock).mockResolvedValue(7)
        const data = { seller_id: 2, purchase_id: null, amount: 40, method: 'cash', note: null }

        await expect(paymentService.recordPayment(data)).resolves.toBe(7)
        expect(createPayment).toHaveBeenCalledWith(data)
    })

    test('propagates validation errors from createPayment', async () => {
        ;(createPayment as jest.Mock).mockRejectedValue(new Error('Payment exceeds the outstanding balance.'))
        await expect(
            paymentService.recordPayment({ seller_id: 2, purchase_id: null, amount: 999, method: null, note: null })
        ).rejects.toThrow('Payment exceeds the outstanding balance.')
    })
})

describe('PaymentService.editPayment / removePayment', () => {
    test('delegates update and delete', async () => {
        ;(updatePayment as jest.Mock).mockResolvedValue(undefined)
        ;(deletePayment as jest.Mock).mockResolvedValue(undefined)

        await paymentService.editPayment(1, { amount: 30 })
        await paymentService.removePayment(1)

        expect(updatePayment).toHaveBeenCalledWith(1, { amount: 30 })
        expect(deletePayment).toHaveBeenCalledWith(1)
    })
})
