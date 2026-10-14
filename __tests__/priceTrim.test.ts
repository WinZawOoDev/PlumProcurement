import { __resetDbForTests } from '../database/connection'
import { __resetSchemaForTests } from '../database/schema'
import { __resetMigrationsForTests } from '../database/migrations'
import { createPrice, updatePrice } from '../database/prices'
import { __resetInMemoryDb } from '../testHelpers/inMemorySqlite'
import { MESSAGES } from '../constants'

jest.mock('react-native-nitro-sqlite', () => require('../testHelpers/inMemorySqlite'))

beforeEach(() => {
    __resetDbForTests()
    __resetSchemaForTests()
    __resetMigrationsForTests()
    __resetInMemoryDb()
})

describe('price whitespace normalization', () => {
    test('trims category/unit on create', async () => {
        const id = await createPrice({ price: 10, category: ' fruit ', unit: ' CUP ' } as never)
        expect(id).toBeGreaterThan(0)
        // Duplicate with different whitespace still collides.
        await expect(
            createPrice({ price: 12, category: 'fruit', unit: 'CUP' } as never)
        ).rejects.toThrow(MESSAGES.ERROR_PRICE_EXISTS)
    })

    test('rejects blank category/unit', async () => {
        await expect(createPrice({ price: 10, category: '   ', unit: 'CUP' } as never)).rejects.toThrow()
        await expect(createPrice({ price: 10, category: 'fruit', unit: '' } as never)).rejects.toThrow()
    })

    test('rejects blank category on update', async () => {
        const id = await createPrice({ price: 10, category: 'fruit', unit: 'CUP' } as never)
        await expect(updatePrice(id, { category: '  ' })).rejects.toThrow()
    })
})
