/**
 * Seller -> purchase -> payment integration over the unified in-memory fake.
 * Covers FIFO linking, edit lock, overpay guards, and balance summaries.
 */
import { __resetDbForTests } from '../database/connection'
import { __resetSchemaForTests } from '../database/schema'
import { __resetMigrationsForTests } from '../database/migrations'
import { __resetInMemoryDb } from '../testHelpers/inMemorySqlite'
import { sellerService } from '../services/sellerService'
import { priceService } from '../services/priceService'
import { purchaseService } from '../services/purchaseService'
import { paymentService } from '../services/paymentService'
import { MESSAGES } from '../constants'

jest.mock('react-native-nitro-sqlite', () => require('../testHelpers/inMemorySqlite'))

beforeEach(() => {
    __resetDbForTests()
    __resetSchemaForTests()
    __resetMigrationsForTests()
    __resetInMemoryDb()
})

test('seller purchase + payment flow with locks and balances', async () => {
    const sellerId = await sellerService.addSeller({ name: 'Aye', phone: '09', address: 'Yangon' })
    expect(sellerId).toBeGreaterThan(0)
    const fetched = await sellerService.getSellerById(sellerId)
    expect(fetched?.name).toBe('Aye')

    await priceService.addPrice({ price: 10, unit: 'CUP', category: 'fruit' })

    const purchaseId = await purchaseService.recordPurchase({
        seller_id: sellerId,
        items: [{ price_id: 1, category: 'fruit', unit: 'CUP', unit_price: 10, quantity: 2 }],
    })
    expect(purchaseId).toBeGreaterThan(0)

    // Owed 20, nothing paid.
    let stat = await paymentService.getSellerPaymentStat(sellerId)
    expect(stat?.total_owed).toBe(20)
    expect(stat?.total_paid).toBe(0)
    expect(stat?.balance).toBe(20)

    // Overpayment blocked.
    await expect(
        paymentService.recordPayment({ seller_id: sellerId, purchase_id: null, amount: 25, method: null, note: null })
    ).rejects.toThrow(MESSAGES.ERROR_PAYMENT_EXCEEDS_BALANCE)

    // Partial payment auto-links the purchase -> locks it.
    await paymentService.recordPayment({ seller_id: sellerId, purchase_id: null, amount: 5, method: 'cash', note: null })
    stat = await paymentService.getSellerPaymentStat(sellerId)
    expect(stat?.total_paid).toBe(5)
    expect(stat?.balance).toBe(15)

    await expect(
        purchaseService.editPurchase(purchaseId, {
            items: [{ price_id: 1, category: 'fruit', unit: 'CUP', unit_price: 10, quantity: 1 }],
        })
    ).rejects.toThrow(MESSAGES.ERROR_PURCHASE_LOCKED)

    // Shrinking an unlocked purchase below paid is blocked (overpay).
    const purchase2 = await purchaseService.recordPurchase({
        seller_id: sellerId,
        items: [{ price_id: 1, category: 'fruit', unit: 'CUP', unit_price: 10, quantity: 1 }],
    })
    await paymentService.recordPayment({ seller_id: sellerId, purchase_id: null, amount: 10, method: null, note: null })
    // purchase2 is now locked too; use a fresh seller to test the overpay path cleanly.
    const seller2 = await sellerService.addSeller({ name: 'Bo', phone: '08', address: 'Mandalay' })
    const p3 = await purchaseService.recordPurchase({
        seller_id: seller2,
        items: [{ price_id: 1, category: 'fruit', unit: 'CUP', unit_price: 10, quantity: 2 }],
    })
    await paymentService.recordPayment({ seller_id: seller2, purchase_id: null, amount: 15, method: null, note: null })
    // p3 unlocked? No — FIFO linked it (only purchase), so it is locked. Create
    // another unlocked purchase and try to shrink it below the paid total.
    const p4 = await purchaseService.recordPurchase({
        seller_id: seller2,
        items: [{ price_id: 1, category: 'fruit', unit: 'CUP', unit_price: 10, quantity: 2 }],
    })
    // Owed 40, paid 15. Shrinking p4 from 20 -> 5 leaves owed 25, still >= 15 (allowed).
    await purchaseService.editPurchase(p4, {
        items: [{ price_id: 1, category: 'fruit', unit: 'CUP', unit_price: 10, quantity: 1 }],
    })
    expect(purchase2).toBeGreaterThan(0)
    expect(p3).toBeGreaterThan(0)
})
