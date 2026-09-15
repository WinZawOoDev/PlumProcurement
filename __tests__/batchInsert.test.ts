import { open } from 'react-native-nitro-sqlite'
import { insertMany, chunkRows } from '../database/batch'
import { createPurchase, updatePurchase } from '../database/purchases'
import { __resetDbForTests } from '../database/connection'

jest.mock('react-native-nitro-sqlite', () => ({
    open: jest.fn(),
}))

const executeAsync = jest.fn()
const transaction = jest.fn()
const close = jest.fn()

beforeEach(() => {
    jest.clearAllMocks()
    __resetDbForTests()
    executeAsync.mockResolvedValue({ results: [], insertId: 1 })
    transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({ executeAsync, commit: jest.fn(), rollback: jest.fn() })
    )
    ;(open as jest.Mock).mockReturnValue({ executeAsync, transaction, close })
})

const items = [
    { price_id: 1, category: 'fruit', unit: 'CUP', unit_price: 5, quantity: 2 },
    { price_id: 2, category: 'veg', unit: 'KG', unit_price: 3, quantity: 1 },
    { price_id: null, category: 'meat', unit: 'KG', unit_price: 10, quantity: 4 },
]

describe('chunkRows', () => {
    test('splits into consecutive chunks and keeps a single short chunk intact', () => {
        expect(chunkRows([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
        expect(chunkRows([1, 2], 5)).toEqual([[1, 2]])
        expect(chunkRows([], 2)).toEqual([[]])
    })
})

describe('insertMany', () => {
    test('issues one multi-row INSERT for all rows instead of one per row', async () => {
        await insertMany({ executeAsync } as never, 'purchase_items', ['a', 'b'], [
            [1, 2],
            [3, 4],
            [5, 6],
        ])

        expect(executeAsync).toHaveBeenCalledTimes(1)
        const [sql, params] = executeAsync.mock.calls[0]
        expect(sql).toContain('INSERT INTO purchase_items (a, b) VALUES (?, ?), (?, ?), (?, ?)')
        expect(params).toEqual([1, 2, 3, 4, 5, 6])
    })

    test('is a no-op for an empty row set', async () => {
        await insertMany({ executeAsync } as never, 'purchase_items', ['a'], [])
        expect(executeAsync).not.toHaveBeenCalled()
    })
})

describe('purchase item writes use a bounded number of statements', () => {
    test('createPurchase inserts every line item in a single statement', async () => {
        await createPurchase({ seller_id: 1, items })

        const inserts = executeAsync.mock.calls.filter(([sql]) =>
            String(sql).includes('INSERT INTO purchase_items')
        )
        expect(inserts).toHaveLength(1)
        const [sql, params] = inserts[0]
        expect(sql).toContain('VALUES (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?)')
        expect(params).toHaveLength(21)
    })

    test('updatePurchase replaces line items in a single statement', async () => {
        executeAsync
            .mockResolvedValueOnce({ results: [] }) // not locked
            .mockResolvedValueOnce({ results: [{ seller_id: null, total: 10 }] })

        await updatePurchase(3, { items })

        const inserts = executeAsync.mock.calls.filter(([sql]) =>
            String(sql).includes('INSERT INTO purchase_items')
        )
        expect(inserts).toHaveLength(1)
        expect(inserts[0][1]).toHaveLength(21)
    })
})
