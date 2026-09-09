import {
    buildPricesCsv,
    buildPricesCsvWithBom,
    buildSellersCsv,
    buildSellersCsvWithBom,
} from '../utils'

describe('buildPricesCsv', () => {
    test('header only for empty list', () => {
        expect(buildPricesCsv([])).toBe('id,date,category,unit,price')
    })

    test('renders rows and BOM variant', () => {
        const csv = buildPricesCsv([
            { id: 1, category: 'fruits', unit: 'PER KG', price: 12.5, created_at: '2026-09-01 10:00:00' },
            { id: 2, category: 'fruits', unit: 'PER UNIT', price: 3, created_at: null },
        ])
        const lines = csv.split('\n')
        expect(lines[0]).toBe('id,date,category,unit,price')
        expect(lines[1]).toBe('1,2026-09-01,fruits,PER KG,12.5')
        expect(lines[2]).toBe('2,,fruits,PER UNIT,3')

        const withBom = buildPricesCsvWithBom([{ id: 1, category: 'fruits', unit: 'PER KG', price: 1 }])
        expect(withBom.charCodeAt(0)).toBe(0xfeff)
    })

    test('escapes commas and quotes in category', () => {
        const csv = buildPricesCsv([
            { id: 1, category: 'plum, red', unit: 'PER KG', price: 2 },
        ])
        expect(csv).toContain('"plum, red"')
    })
})

describe('buildSellersCsv', () => {
    test('header only for empty list', () => {
        expect(buildSellersCsv([])).toBe('id,name,phone,address')
    })

    test('renders rows with null phone as empty and BOM variant', () => {
        const csv = buildSellersCsv([
            { id: 1, name: 'U Ba', phone: '09-123', address: null },
            { id: 2, name: 'Daw Mya', phone: null, address: null },
        ])
        const lines = csv.split('\n')
        expect(lines[0]).toBe('id,name,phone,address')
        expect(lines[1]).toBe('1,U Ba,09-123,')
        expect(lines[2]).toBe('2,Daw Mya,,')

        const withBom = buildSellersCsvWithBom([{ id: 1, name: 'U Ba', phone: null, address: null }])
        expect(withBom.charCodeAt(0)).toBe(0xfeff)
    })

    test('escapes quotes in name', () => {
        const csv = buildSellersCsv([{ id: 1, name: 'U "Ba"', phone: null, address: null }])
        expect(csv).toContain('"U ""Ba"""')
    })
})
