import { LATEST_VERSION } from '../database/migrations'

/**
 * Unified in-memory fake of `react-native-nitro-sqlite` that persists rows
 * across prices / sellers / purchases / purchase_items / payments /
 * app_settings. Bootstrap reports the current LATEST_VERSION so the migration
 * runner is skipped; all other DDL is a no-op.
 *
 * Query matching is intentionally narrow: it handles exactly the SQL shapes
 * emitted by database/*. Hand-rolled mocks elsewhere should migrate to this.
 *
 * KNOWN GAPS (covered by testHelpers/sqliteAdapter.ts + __tests__/dbSqlite*):
 * transactions never roll back, foreign keys are not enforced, and migration
 * bodies run as no-ops, so migration/FIFO/rollback behavior must be tested
 * against real SQLite instead.
 */

type PriceRow = {
    id: number
    price: number
    unit: string | null
    category: string | null
    created_at: string
    updated_at: string
}

type SellerRow = {
    id: number
    name: string
    phone: string | null
    address: string | null
    created_at: string
    updated_at: string
}

type PurchaseRow = {
    id: number
    seller_id: number | null
    total: number
    purchased_at: string
    created_at: string
    updated_at: string
}

type PurchaseItemRow = {
    id: number
    purchase_id: number
    price_id: number | null
    category: string
    unit: string
    unit_price: number
    quantity: number
    line_total: number
}

type PaymentRow = {
    id: number
    seller_id: number
    purchase_id: number | null
    amount: number
    /** 'auto' | 'explicit'; missing mirrors the column DEFAULT 'explicit' */
    link_source?: string
    method: string | null
    note: string | null
    paid_at: string
    created_at: string
}

let prices: PriceRow[] = []
let sellers: SellerRow[] = []
let purchases: PurchaseRow[] = []
let purchaseItems: PurchaseItemRow[] = []
let payments: PaymentRow[] = []
let settings: Record<string, string> = {}
let nextPriceId = 1
let nextSellerId = 1
let nextPurchaseId = 1
let nextItemId = 1
let nextPaymentId = 1

export function __resetInMemoryDb(): void {
    prices = []
    sellers = []
    purchases = []
    purchaseItems = []
    payments = []
    settings = {}
    nextPriceId = 1
    nextSellerId = 1
    nextPurchaseId = 1
    nextItemId = 1
    nextPaymentId = 1
}

type QueryResult = { results?: unknown[]; insertId?: number }

function norm(query: string): string {
    return String(query).replace(/\s+/g, ' ').trim()
}

function runQuery(query: string, params: unknown[] = []): QueryResult {
    const q = norm(query)
    // --- pragmas / DDL ---
    if (/^PRAGMA user_version$/i.test(q)) return { results: [{ user_version: LATEST_VERSION }] }
    if (/^PRAGMA/i.test(q)) return { results: [] }
    if (/^CREATE TABLE/i.test(q)) return { results: [] }
    if (/^CREATE (UNIQUE )?INDEX/i.test(q)) return { results: [] }
    if (/^DROP (TABLE|INDEX)/i.test(q)) return { results: [] }
    if (/^ALTER TABLE/i.test(q)) return { results: [] }

    // --- app_settings ---
    if (/^SELECT value FROM app_settings WHERE key = \?$/i.test(q)) {
        const [key] = params as [string]
        return { results: settings[key] !== undefined ? [{ value: settings[key] }] : [] }
    }
    if (/^INSERT OR REPLACE INTO app_settings/i.test(q)) {
        const [key, value] = params as [string, string]
        settings[key] = value
        return { results: [] }
    }

    // --- prices ---
    if (/^SELECT id FROM prices WHERE category IS \? AND unit IS \? LIMIT 1$/i.test(q)) {
        const [category, unit] = params as Array<string | null>
        return {
            results: prices
                .filter((p) => p.category === category && p.unit === unit)
                .map((p) => ({ id: p.id })),
        }
    }
    if (/^SELECT id FROM prices WHERE category IS \? AND unit IS \? AND id <> \? LIMIT 1$/i.test(q)) {
        const [category, unit, id] = params as Array<string | number | null>
        return {
            results: prices
                .filter((p) => p.category === category && p.unit === unit && p.id !== id)
                .map((p) => ({ id: p.id })),
        }
    }
    if (/^SELECT category, unit FROM prices WHERE id = \?$/i.test(q)) {
        const [id] = params as [number]
        const row = prices.find((p) => p.id === id)
        return { results: row ? [{ category: row.category, unit: row.unit }] : [] }
    }
    if (/^SELECT id FROM prices WHERE id = \? LIMIT 1$/i.test(q)) {
        const [id] = params as [number]
        const row = prices.find((p) => p.id === id)
        return { results: row ? [{ id: row.id }] : [] }
    }
    if (/^SELECT \* FROM prices ORDER BY id DESC$/i.test(q)) {
        return { results: [...prices].sort((a, b) => b.id - a.id) }
    }
    if (/^SELECT COUNT\(\*\) AS count FROM purchase_items WHERE price_id = \?$/i.test(q)) {
        const [id] = params as [number]
        return { results: [{ count: purchaseItems.filter((i) => i.price_id === id).length }] }
    }
    if (/^INSERT INTO prices/i.test(q)) {
        const [price, unit, category] = params as [number, string, string]
        const row: PriceRow = { id: nextPriceId++, price, unit, category, created_at: '', updated_at: '' }
        prices.push(row)
        return { insertId: row.id }
    }
    if (/^UPDATE prices SET/i.test(q)) {
        const id = params[params.length - 1] as number
        const row = prices.find((p) => p.id === id)
        if (row) {
            let idx = 0
            if (/price = \?/i.test(q)) row.price = params[idx++] as number
            if (/unit = \?/i.test(q)) row.unit = params[idx++] as string
            if (/category = \?/i.test(q)) row.category = params[idx++] as string
            row.updated_at = ''
        }
        return { results: [] }
    }
    if (/^DELETE FROM prices WHERE id = \?$/i.test(q)) {
        const [id] = params as [number]
        prices = prices.filter((p) => p.id !== id)
        return { results: [] }
    }

    // --- sellers ---
    if (/^SELECT \* FROM sellers ORDER BY name ASC$/i.test(q)) {
        return { results: [...sellers].sort((a, b) => a.name.localeCompare(b.name)) }
    }
    if (/^SELECT \* FROM sellers WHERE id = \? LIMIT 1$/i.test(q)) {
        const [id] = params as [number]
        const row = sellers.find((s) => s.id === id)
        return { results: row ? [row] : [] }
    }
    if (/^SELECT 1 AS ok FROM sellers WHERE id = \? LIMIT 1$/i.test(q)) {
        const [id] = params as [number]
        return { results: sellers.some((s) => s.id === id) ? [{ ok: 1 }] : [] }
    }
    if (/^SELECT COUNT\(\*\) AS count FROM sellers/i.test(q)) {
        return { results: [{ count: sellers.length }] }
    }
    if (/^SELECT COUNT\(\*\) AS count FROM purchases WHERE seller_id = \?$/i.test(q)) {
        const [id] = params as [number]
        return { results: [{ count: purchases.filter((p) => p.seller_id === id).length }] }
    }
    if (/^SELECT COUNT\(\*\) AS count FROM payments WHERE seller_id = \?$/i.test(q)) {
        const [id] = params as [number]
        return { results: [{ count: payments.filter((p) => p.seller_id === id).length }] }
    }
    if (/^INSERT INTO sellers/i.test(q)) {
        const [name, phone, address] = params as [string, string | null, string | null]
        const row: SellerRow = { id: nextSellerId++, name, phone, address, created_at: '', updated_at: '' }
        sellers.push(row)
        return { insertId: row.id }
    }
    if (/^UPDATE sellers/i.test(q)) {
        const id = params[params.length - 1] as number
        const row = sellers.find((s) => s.id === id)
        if (row) {
            let idx = 0
            if (/name = \?/i.test(q)) row.name = params[idx++] as string
            if (/phone = \?/i.test(q)) row.phone = params[idx++] as string
            if (/address = \?/i.test(q)) row.address = params[idx++] as string
        }
        return { results: [] }
    }
    if (/^DELETE FROM sellers WHERE id = \?$/i.test(q)) {
        const [id] = params as [number]
        sellers = sellers.filter((s) => s.id !== id)
        return { results: [] }
    }

    // --- purchases ---
    if (/^INSERT INTO purchases \(seller_id, total\)/i.test(q)) {
        const [seller_id, total] = params as [number | null, number]
        const row: PurchaseRow = {
            id: nextPurchaseId++, seller_id, total,
            purchased_at: '', created_at: '', updated_at: '',
        }
        purchases.push(row)
        return { insertId: row.id }
    }
    if (/^SELECT seller_id, total FROM purchases WHERE id = \? LIMIT 1$/i.test(q)) {
        const [id] = params as [number]
        const row = purchases.find((p) => p.id === id)
        return { results: row ? [{ seller_id: row.seller_id, total: row.total }] : [] }
    }
    if (/^SELECT id, seller_id FROM purchases WHERE id = \? LIMIT 1$/i.test(q)) {
        const [id] = params as [number]
        const row = purchases.find((p) => p.id === id)
        return { results: row ? [{ id: row.id, seller_id: row.seller_id }] : [] }
    }
    if (/^SELECT COALESCE\(SUM\(total\), 0\) AS total FROM purchases WHERE seller_id = \?$/i.test(q)) {
        const [sellerId] = params as [number]
        const total = purchases.filter((p) => p.seller_id === sellerId).reduce((s, p) => s + p.total, 0)
        return { results: [{ total }] }
    }
    if (/^SELECT \* FROM purchase_items WHERE purchase_id IN/i.test(q)) {
        const ids = params as number[]
        return { results: purchaseItems.filter((i) => ids.includes(i.purchase_id)) }
    }
    if (/^SELECT p\.id FROM purchases p WHERE p\.seller_id = \?/i.test(q)) {
        const [sellerId] = params as [number]
        const linked = new Set(payments.map((p) => p.purchase_id))
        const rows = purchases
            .filter((p) => p.seller_id === sellerId && !linked.has(p.id))
            .sort((a, b) => a.id - b.id)
            .slice(0, 1)
            .map((p) => ({ id: p.id }))
        return { results: rows }
    }
    if (/^DELETE FROM purchase_items WHERE purchase_id = \?$/i.test(q)) {
        const [id] = params as [number]
        purchaseItems = purchaseItems.filter((i) => i.purchase_id !== id)
        return { results: [] }
    }
    if (/^INSERT INTO purchase_items/i.test(q)) {
        // bulk insert via insertMany: query has N tuples, params flattened 7 per row
        const flat = params as unknown[]
        for (let i = 0; i < flat.length; i += 7) {
            purchaseItems.push({
                id: nextItemId++,
                purchase_id: flat[i] as number,
                price_id: flat[i + 1] as number | null,
                category: flat[i + 2] as string,
                unit: flat[i + 3] as string,
                unit_price: flat[i + 4] as number,
                quantity: flat[i + 5] as number,
                line_total: flat[i + 6] as number,
            })
        }
        return { insertId: nextItemId - 1 }
    }
    if (/^UPDATE purchases SET seller_id = \?, updated_at/i.test(q)) {
        const [sellerId, id] = params as [number | null, number]
        const row = purchases.find((p) => p.id === id)
        if (row) row.seller_id = sellerId
        return { results: [] }
    }
    if (/^UPDATE purchases SET total = \?, updated_at/i.test(q)) {
        const [total, id] = params as [number, number]
        const row = purchases.find((p) => p.id === id)
        if (row) row.total = total
        return { results: [] }
    }
    if (/^DELETE FROM purchases WHERE id = \?$/i.test(q)) {
        const [id] = params as [number]
        purchases = purchases.filter((p) => p.id !== id)
        purchaseItems = purchaseItems.filter((i) => i.purchase_id !== id)
        return { results: [] }
    }
    if (/FROM purchases p LEFT JOIN sellers s/i.test(q)) {
        // fetchPurchasesPage / summary / unpaid — return simplified rows
        if (/COUNT\(\*\) AS count/i.test(q)) {
            return { results: [{ count: purchases.length, total: purchases.reduce((s, p) => s + p.total, 0) }] }
        }
        if (/NOT EXISTS \(SELECT 1 FROM payments/i.test(q)) {
            const [sellerId, limit] = params as [number, number]
            const linked = new Set(payments.map((p) => p.purchase_id))
            const rows = purchases
                .filter((p) => p.seller_id === sellerId && !linked.has(p.id))
                .sort((a, b) => a.id - b.id)
                .slice(0, limit)
                .map((p) => ({ ...p, seller_name: null, has_payment: 0, items: [] }))
            return { results: rows }
        }
        // default page: honor limit+1 probe via last param
        const limit = (params[params.length - 1] as number) ?? 50
        const rows = [...purchases]
            .sort((a, b) => b.id - a.id)
            .slice(0, limit)
            .map((p) => ({
                ...p,
                seller_name: sellers.find((s) => s.id === p.seller_id)?.name ?? null,
                has_payment: payments.some((pay) => pay.purchase_id === p.id) ? 1 : 0,
            }))
        return { results: rows }
    }
    if (/SELECT seller_id, COUNT\(\*\) AS purchase_count, SUM\(total\) AS total_spent FROM purchases/i.test(q)) {
        const by = new Map<number, { purchase_count: number; total_spent: number }>()
        for (const p of purchases) {
            if (p.seller_id == null) continue
            const e = by.get(p.seller_id) ?? { purchase_count: 0, total_spent: 0 }
            e.purchase_count += 1
            e.total_spent += p.total
            by.set(p.seller_id, e)
        }
        return { results: [...by.entries()].map(([seller_id, v]) => ({ seller_id, ...v })) }
    }

    // --- payments ---
    if (/^SELECT COALESCE\(SUM\(amount\), 0\) AS total FROM payments WHERE seller_id = \?$/i.test(q)) {
        const [sellerId] = params as [number]
        const total = payments.filter((p) => p.seller_id === sellerId).reduce((s, p) => s + p.amount, 0)
        return { results: [{ total }] }
    }
    if (/^SELECT COALESCE\(SUM\(amount\), 0\) AS total FROM payments WHERE seller_id = \? AND id != \?$/i.test(q)) {
        const [sellerId, exclude] = params as [number, number]
        const total = payments
            .filter((p) => p.seller_id === sellerId && p.id !== exclude)
            .reduce((s, p) => s + p.amount, 0)
        return { results: [{ total }] }
    }
    if (/^SELECT 1 FROM payments WHERE purchase_id = \? LIMIT 1$/i.test(q)) {
        const [id] = params as [number]
        return { results: payments.some((p) => p.purchase_id === id) ? [{ '1': 1 }] : [] }
    }
    if (/^SELECT 1 AS ok FROM payments WHERE purchase_id = \? LIMIT 1$/i.test(q)) {
        const [id] = params as [number]
        return { results: payments.some((p) => p.purchase_id === id) ? [{ ok: 1 }] : [] }
    }
    if (/^SELECT seller_id, amount FROM payments WHERE id = \? LIMIT 1$/i.test(q)) {
        const [id] = params as [number]
        const row = payments.find((p) => p.id === id)
        return { results: row ? [{ seller_id: row.seller_id, amount: row.amount }] : [] }
    }
    if (/^SELECT seller_id FROM payments WHERE id = \? LIMIT 1$/i.test(q)) {
        const [id] = params as [number]
        const row = payments.find((p) => p.id === id)
        return { results: row ? [{ seller_id: row.seller_id }] : [] }
    }
    if (/^INSERT INTO payments/i.test(q)) {
        const [seller_id, purchase_id, amount, link_source, method, note] = params as [
            number, number | null, number, string, string | null, string | null,
        ]
        const row: PaymentRow = {
            id: nextPaymentId++, seller_id, purchase_id, amount, link_source, method, note,
            paid_at: '', created_at: '',
        }
        payments.push(row)
        return { insertId: row.id }
    }
    if (/^UPDATE payments SET/i.test(q) && !/purchase_id = \(/i.test(q)) {
        const id = params[params.length - 1] as number
        const row = payments.find((p) => p.id === id)
        if (row && /amount = \?/i.test(q)) {
            // values order mirrors payments.ts setClauses
            row.amount = params[0] as number
        }
        return { results: [] }
    }
    if (/^UPDATE payments SET purchase_id = \(/i.test(q)) {
        // Mirrors reallocateSellerPayments: only 'auto' rows move (a missing
        // link_source means the column DEFAULT 'explicit'), ranked by id and
        // mapped onto purchases not held by an explicit link.
        const [sellerId] = params as [number]
        const isExplicit = (p: PaymentRow): boolean => p.link_source !== 'auto'
        const heldByExplicit = new Set(
            payments
                .filter((p) => p.seller_id === sellerId && isExplicit(p) && p.purchase_id != null)
                .map((p) => p.purchase_id as number)
        )
        const sellerPurchases = purchases
            .filter((p) => p.seller_id === sellerId && !heldByExplicit.has(p.id))
            .sort((a, b) => a.id - b.id)
        const sellerAutoPayments = payments
            .filter((p) => p.seller_id === sellerId && !isExplicit(p))
            .sort((a, b) => a.id - b.id)
        sellerAutoPayments.forEach((pay, i) => {
            pay.purchase_id = sellerPurchases[i]?.id ?? null
        })
        return { results: [] }
    }
    if (/^DELETE FROM payments WHERE id = \?$/i.test(q)) {
        const [id] = params as [number]
        payments = payments.filter((p) => p.id !== id)
        return { results: [] }
    }
    if (/FROM sellers s LEFT JOIN \(/i.test(q)) {
        // balance summaries
        if (/WHERE s\.id = \?/i.test(q)) {
            const [id] = params as [number]
            const s = sellers.find((x) => x.id === id)
            if (!s) return { results: [] }
            const owed = purchases.filter((p) => p.seller_id === id).reduce((t, p) => t + p.total, 0)
            const paid = payments.filter((p) => p.seller_id === id).reduce((t, p) => t + p.amount, 0)
            return { results: [{ seller_id: id, seller_name: s.name, total_owed: owed, total_paid: paid }] }
        }
        return {
            results: sellers.map((s) => ({
                seller_id: s.id,
                seller_name: s.name,
                total_owed: purchases.filter((p) => p.seller_id === s.id).reduce((t, p) => t + p.total, 0),
                total_paid: payments.filter((p) => p.seller_id === s.id).reduce((t, p) => t + p.amount, 0),
            })),
        }
    }
    if (/^SELECT \* FROM payments WHERE/i.test(q)) {
        const [sellerId] = params as [number]
        return { results: payments.filter((p) => p.seller_id === sellerId).sort((a, b) => b.id - a.id) }
    }

    return { results: [] }
}

type TxHandle = {
    executeAsync: (query: string, params?: unknown[]) => Promise<QueryResult>
    commit: () => Record<string, never>
    rollback: () => Record<string, never>
}

const txHandle: TxHandle = {
    executeAsync: (qq, pp) => Promise.resolve(runQuery(qq, (pp as unknown[]) ?? [])),
    commit: () => ({}),
    rollback: () => ({}),
}

export function open() {
    return {
        executeAsync: (qq: string, pp?: unknown[]) => Promise.resolve(runQuery(qq, (pp as unknown[]) ?? [])),
        transaction: async (callback: (tx: TxHandle) => Promise<unknown>) => callback(txHandle),
        close: () => {},
    }
}
