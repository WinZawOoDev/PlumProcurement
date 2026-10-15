/**
 * Integration tests against real SQLite (testHelpers/sqliteAdapter.ts backed
 * by node:sqlite). These cover what the in-memory fake cannot: the actual
 * FIFO reallocation SQL, migration bodies, foreign keys, integer money math,
 * and transaction rollback.
 */
import { __resetDbForTests, initDb } from '../database/connection'
import { __resetSchemaForTests, initializeSchema } from '../database/schema'
import { __resetMigrationsForTests, LATEST_VERSION, runMigrations } from '../database/migrations'
import { MESSAGES } from '../constants'

jest.mock('react-native-nitro-sqlite', () => require('../testHelpers/sqliteAdapter'))

beforeEach(() => {
    jest.clearAllMocks()
    __resetDbForTests()
    __resetSchemaForTests()
    __resetMigrationsForTests()
})

async function rawAll(query: string, params: Array<string | number | null> = []) {
    const db = initDb()
    const { results } = await db.executeAsync(query, params as never)
    return results as unknown as Array<Record<string, unknown>>
}

describe('deletePayment FIFO reallocation on real SQLite', () => {
    test('deletePayment succeeds and shifts remaining auto payments down', async () => {
        const { sellerService } = require('../services/sellerService') as typeof import('../services/sellerService')
        const { purchaseService } = require('../services/purchaseService') as typeof import('../services/purchaseService')
        const { paymentService } = require('../services/paymentService') as typeof import('../services/paymentService')
        const { priceService } = require('../services/priceService') as typeof import('../services/priceService')

        const sellerId = await sellerService.addSeller({ name: 'A', phone: '1', address: 'x' })
        const priceId = await priceService.addPrice({ price: 10, unit: 'CUP', category: 'fruit' })
        const item = { price_id: priceId, category: 'fruit', unit: 'CUP', unit_price: 10, quantity: 1 }
        const p1 = await purchaseService.recordPurchase({ seller_id: sellerId, items: [item] })
        const p2 = await purchaseService.recordPurchase({ seller_id: sellerId, items: [item] })
        await purchaseService.recordPurchase({ seller_id: sellerId, items: [item] })

        const a1 = await paymentService.recordPayment({ seller_id: sellerId, purchase_id: null, amount: 10, method: null, note: null })
        const a2 = await paymentService.recordPayment({ seller_id: sellerId, purchase_id: null, amount: 10, method: null, note: null })

        // Auto links: oldest payment -> oldest purchase.
        let rows = await rawAll(`SELECT id, purchase_id FROM payments ORDER BY id`)
        expect(rows).toEqual([
            { id: a1, purchase_id: p1 },
            { id: a2, purchase_id: p2 },
        ])

        // Deleting the first payment shifts the second one down to P1.
        // (The old LIMIT/OFFSET form of this statement fails on real SQLite
        // with "no such column: payments.seller_id".)
        await paymentService.removePayment(a1)
        rows = await rawAll(`SELECT id, purchase_id FROM payments ORDER BY id`)
        expect(rows).toEqual([{ id: a2, purchase_id: p1 }])
    })

    test('deleting a payment never moves an explicit link', async () => {
        const { sellerService } = require('../services/sellerService') as typeof import('../services/sellerService')
        const { purchaseService } = require('../services/purchaseService') as typeof import('../services/purchaseService')
        const { paymentService } = require('../services/paymentService') as typeof import('../services/paymentService')
        const { priceService } = require('../services/priceService') as typeof import('../services/priceService')

        const sellerId = await sellerService.addSeller({ name: 'B', phone: '1', address: 'x' })
        const priceId = await priceService.addPrice({ price: 10, unit: 'CUP', category: 'fruit' })
        const item = { price_id: priceId, category: 'fruit', unit: 'CUP', unit_price: 10, quantity: 1 }
        const p1 = await purchaseService.recordPurchase({ seller_id: sellerId, items: [item] })
        await purchaseService.recordPurchase({ seller_id: sellerId, items: [item] })
        const p3 = await purchaseService.recordPurchase({ seller_id: sellerId, items: [item] })

        const a1 = await paymentService.recordPayment({ seller_id: sellerId, purchase_id: null, amount: 10, method: null, note: null })
        const e1 = await paymentService.recordPayment({ seller_id: sellerId, purchase_id: p3, amount: 10, method: null, note: null })

        await paymentService.removePayment(a1)

        const rows = await rawAll(`SELECT id, purchase_id FROM payments ORDER BY id`)
        expect(rows).toEqual([{ id: e1, purchase_id: p3 }])

        // P1 is unlocked again, P3 stays locked by the explicit link.
        const page = await purchaseService.getPurchasesPage({ limit: 10 })
        const byId = new Map(page.items.map((p) => [p.id, p.has_payment]))
        expect(byId.get(p1)).toBe(0)
        expect(byId.get(p3)).toBe(1)
    })
})

describe('migration v9 on real SQLite', () => {
    test('unlinks items before deleting blank prices and records the version', async () => {
        const db = initDb()
        await db.executeAsync(`CREATE TABLE sellers(id INTEGER PRIMARY KEY, name TEXT)`)
        await db.executeAsync(`CREATE TABLE prices(id INTEGER PRIMARY KEY, price REAL, unit TEXT, category TEXT)`)
        await db.executeAsync(`CREATE TABLE purchases(
            id INTEGER PRIMARY KEY, seller_id INTEGER REFERENCES sellers(id),
            total REAL, purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,
            created_at TEXT, updated_at TEXT)`)
        await db.executeAsync(`CREATE TABLE purchase_items(
            id INTEGER PRIMARY KEY,
            purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
            price_id INTEGER REFERENCES prices(id) ON DELETE RESTRICT,
            category TEXT, unit TEXT, unit_price REAL, quantity INTEGER, line_total REAL)`)
        await db.executeAsync(`CREATE TABLE payments(
            id INTEGER PRIMARY KEY, seller_id INTEGER NOT NULL, purchase_id INTEGER,
            amount REAL, method TEXT, note TEXT,
            paid_at TEXT DEFAULT CURRENT_TIMESTAMP, created_at TEXT)`)
        await db.executeAsync(`CREATE TABLE app_settings(key TEXT PRIMARY KEY, value TEXT)`)
        await db.executeAsync(`PRAGMA foreign_keys = ON`)
        await db.executeAsync(`INSERT INTO sellers(id, name) VALUES (1, 'S')`)
        await db.executeAsync(`INSERT INTO prices(id, price, unit, category) VALUES (1, 5, '', 'fruit')`)
        await db.executeAsync(`INSERT INTO purchases(id, seller_id, total) VALUES (1, 1, 10)`)
        await db.executeAsync(
            `INSERT INTO purchase_items(id, purchase_id, price_id, category, unit, unit_price, quantity, line_total)
             VALUES (1, 1, 1, 'fruit', 'CUP', 10, 1, 10)`
        )
        await db.executeAsync(`PRAGMA user_version = 8`)

        // Before the fix this failed with FOREIGN KEY constraint failed and
        // retried on every launch (the version was never recorded).
        await expect(runMigrations()).resolves.toBeUndefined()

        const items = await rawAll(`SELECT price_id FROM purchase_items WHERE id = 1`)
        expect(items).toEqual([{ price_id: null }])
        expect(await rawAll(`SELECT id FROM prices`)).toEqual([])
        const version = await rawAll(`PRAGMA user_version`)
        expect(version).toEqual([{ user_version: LATEST_VERSION }])
    })
})

describe('integer money math on real SQLite', () => {
    test('line totals and balances are exact (no float artifacts)', async () => {
        const { sellerService } = require('../services/sellerService') as typeof import('../services/sellerService')
        const { purchaseService } = require('../services/purchaseService') as typeof import('../services/purchaseService')
        const { paymentService } = require('../services/paymentService') as typeof import('../services/paymentService')
        const { priceService } = require('../services/priceService') as typeof import('../services/priceService')

        const sellerId = await sellerService.addSeller({ name: 'C', phone: '1', address: 'x' })
        const priceId = await priceService.addPrice({ price: 0.1, unit: 'CUP', category: 'fruit' })
        await purchaseService.recordPurchase({
            seller_id: sellerId,
            items: [{ price_id: priceId, category: 'fruit', unit: 'CUP', unit_price: 0.1, quantity: 3 }],
        })

        // 0.1 * 3 in floating point is 0.30000000000000004; minor units are exact.
        const page = await purchaseService.getPurchasesPage({ limit: 5 })
        expect(page.items[0].total).toBe(0.3)
        expect(page.items[0].items[0].line_total).toBe(0.3)

        // Paying exactly the balance succeeds (no epsilon rejection);
        // a cent more is blocked.
        await paymentService.recordPayment({ seller_id: sellerId, purchase_id: null, amount: 0.3, method: null, note: null })
        await expect(
            paymentService.recordPayment({ seller_id: sellerId, purchase_id: null, amount: 0.31, method: null, note: null })
        ).rejects.toThrow(MESSAGES.ERROR_PAYMENT_EXCEEDS_BALANCE)
    })

    test('v11 converts legacy REAL money to minor units exactly once', async () => {
        const db = initDb()
        await db.executeAsync(`CREATE TABLE sellers(id INTEGER PRIMARY KEY, name TEXT)`)
        await db.executeAsync(`CREATE TABLE prices(id INTEGER PRIMARY KEY, price REAL, unit TEXT NOT NULL, category TEXT NOT NULL)`)
        await db.executeAsync(`CREATE TABLE purchases(
            id INTEGER PRIMARY KEY, seller_id INTEGER, total REAL, created_at TEXT, updated_at TEXT)`)
        await db.executeAsync(`CREATE TABLE purchase_items(
            id INTEGER PRIMARY KEY, purchase_id INTEGER NOT NULL, price_id INTEGER,
            category TEXT NOT NULL, unit TEXT NOT NULL,
            unit_price REAL NOT NULL, quantity INTEGER NOT NULL, line_total REAL NOT NULL)`)
        await db.executeAsync(`CREATE TABLE payments(
            id INTEGER PRIMARY KEY, seller_id INTEGER NOT NULL, purchase_id INTEGER,
            amount REAL NOT NULL, method TEXT, note TEXT,
            paid_at TEXT DEFAULT CURRENT_TIMESTAMP, created_at TEXT)`)
        await db.executeAsync(`CREATE TABLE app_settings(key TEXT PRIMARY KEY, value TEXT)`)
        await db.executeAsync(`INSERT INTO prices(id, price, unit, category) VALUES (1, 9.99, 'CUP', 'fruit')`)
        await db.executeAsync(`INSERT INTO purchases(id, seller_id, total) VALUES (1, 1, 29.97)`)
        await db.executeAsync(
            `INSERT INTO purchase_items(id, purchase_id, price_id, category, unit, unit_price, quantity, line_total)
             VALUES (1, 1, 1, 'fruit', 'CUP', 9.99, 3, 29.97)`
        )
        await db.executeAsync(`INSERT INTO payments(id, seller_id, purchase_id, amount) VALUES (1, 1, NULL, 5.5)`)
        await db.executeAsync(`PRAGMA user_version = 10`)

        await expect(runMigrations()).resolves.toBeUndefined()

        // Stored values are now exact integers.
        expect(await rawAll(`SELECT price FROM prices WHERE id = 1`)).toEqual([{ price: 999 }])
        expect(await rawAll(`SELECT total FROM purchases WHERE id = 1`)).toEqual([{ total: 2997 }])
        expect(await rawAll(`SELECT unit_price, line_total FROM purchase_items WHERE id = 1`)).toEqual([
            { unit_price: 999, line_total: 2997 },
        ])
        expect(await rawAll(`SELECT amount FROM payments WHERE id = 1`)).toEqual([{ amount: 550 }])

        // And the service layer reads them back as major units.
        const { priceService } = require('../services/priceService') as typeof import('../services/priceService')
        const prices = await priceService.getPrices()
        expect(prices).toEqual([
            expect.objectContaining({ id: 1, price: 9.99, unit: 'CUP', category: 'fruit' }),
        ])
    })
})

describe('transaction rollback on real SQLite', () => {
    test('a failed purchase update leaves header and items untouched', async () => {
        const { sellerService } = require('../services/sellerService') as typeof import('../services/sellerService')
        const { purchaseService } = require('../services/purchaseService') as typeof import('../services/purchaseService')
        const { priceService } = require('../services/priceService') as typeof import('../services/priceService')

        const sellerId = await sellerService.addSeller({ name: 'D', phone: '1', address: 'x' })
        const priceId = await priceService.addPrice({ price: 10, unit: 'CUP', category: 'fruit' })
        const item = { price_id: priceId, category: 'fruit', unit: 'CUP', unit_price: 10, quantity: 1 }
        const purchaseId = await purchaseService.recordPurchase({ seller_id: sellerId, items: [item] })

        // The update fails validation against a deleted price AFTER the header
        // was read: nothing may be partially written.
        await expect(
            purchaseService.editPurchase(purchaseId, {
                items: [{ ...item, price_id: 424242 }],
            })
        ).rejects.toThrow(MESSAGES.ERROR_PRICE_NOT_FOUND)

        const page = await purchaseService.getPurchasesPage({ limit: 5 })
        expect(page.items[0].total).toBe(10)
        expect(page.items[0].items).toHaveLength(1)
        expect(page.items[0].items[0].quantity).toBe(1)
    })

    test('adapter transactions roll back partial writes', async () => {
        const db = initDb()
        await db.executeAsync(`CREATE TABLE t(id INTEGER PRIMARY KEY, v TEXT)`)
        await expect(
            db.transaction(async (tx) => {
                await tx.executeAsync(`INSERT INTO t(v) VALUES (?)`, ['kept?'])
                throw new Error('boom')
            })
        ).rejects.toThrow('boom')
        expect(await rawAll(`SELECT * FROM t`)).toEqual([])
    })
})

describe('schema bootstrap on real SQLite', () => {
    test('fresh installs create the current schema and reach LATEST_VERSION', async () => {
        await expect(initializeSchema()).resolves.toBeUndefined()
        expect(await rawAll(`PRAGMA user_version`)).toEqual([{ user_version: LATEST_VERSION }])
        const tables = await rawAll(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`)
        expect(tables.map((t) => t.name).sort()).toEqual(
            expect.arrayContaining(['app_settings', 'payments', 'prices', 'purchase_items', 'purchases', 'sellers'])
        )
        const paymentCols = await rawAll(`PRAGMA table_info(payments)`)
        expect(paymentCols.map((c) => c.name)).toContain('link_source')
    })
})
