import {
    capitalize,
    debounce,
    formatDate,
    formatDateDisplay,
    formatNumber,
    toMyanmarDigits,
    toWesternDigits,
    buildPurchasesCsv,
    buildPurchasesCsvWithBom,
    getCsvFilename,
} from '../utils'
import { changeLanguage } from '../i18n'

describe('capitalize', () => {
    test('capitalizes first letter', () => {
        expect(capitalize('hello')).toBe('Hello')
    })

    test('handles empty string', () => {
        expect(capitalize('')).toBe('')
    })
})

describe('debounce', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    test('calls function once after wait period', () => {
        const fn = jest.fn()
        const debounced = debounce(fn, 100)

        debounced()
        debounced()
        debounced()
        expect(fn).not.toHaveBeenCalled()

        jest.advanceTimersByTime(100)
        expect(fn).toHaveBeenCalledTimes(1)
    })

    test('cancel drops a pending invocation', () => {
        const fn = jest.fn()
        const debounced = debounce(fn, 100)

        debounced('first')
        debounced.cancel()
        jest.advanceTimersByTime(100)

        expect(fn).not.toHaveBeenCalled()
    })

    test('invokes with the latest arguments', () => {
        const fn = jest.fn()
        const debounced = debounce(fn, 100)

        debounced('a')
        debounced('b')
        jest.advanceTimersByTime(100)

        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith('b')
    })
})

describe('formatDate', () => {
    test('extracts date portion from sqlite datetime', () => {
        expect(formatDate('2026-08-24 13:45:00')).toBe('2026-08-24')
    })

    test('returns empty string for missing values', () => {
        expect(formatDate(null)).toBe('')
        expect(formatDate(undefined)).toBe('')
        expect(formatDate('')).toBe('')
    })
})

describe('formatDateDisplay', () => {
    afterEach(async () => {
        await changeLanguage('en')
    })

    test('keeps Western digits in English', () => {
        expect(formatDateDisplay('2026-08-24 13:45:00')).toBe('2026-08-24')
    })

    test('uses Myanmar digits in Myanmar', async () => {
        await changeLanguage('my')
        expect(formatDateDisplay('2026-08-24 13:45:00')).toBe('၂၀၂၆-၀၈-၂၄')
    })

    test('returns empty string for missing values', () => {
        expect(formatDateDisplay(null)).toBe('')
        expect(formatDateDisplay(undefined)).toBe('')
    })
})

describe('Myanmar digit helpers', () => {
    test('toMyanmarDigits converts Western digits', () => {
        expect(toMyanmarDigits('12.50')).toBe('၁၂.၅၀')
        expect(toMyanmarDigits(0)).toBe('၀')
    })

    test('toWesternDigits normalizes Myanmar digits back', () => {
        expect(toWesternDigits('၁၂.၅၀')).toBe('12.50')
    })

    test('round-trips a date string', () => {
        expect(toWesternDigits(toMyanmarDigits('2026-09-11'))).toBe('2026-09-11')
    })
})

describe('formatNumber', () => {
    afterEach(async () => {
        await changeLanguage('en')
    })

    test('uses Western digits in English', () => {
        expect(formatNumber(12.5)).toBe('12.50')
        expect(formatNumber(3, 0)).toBe('3')
    })

    test('uses Myanmar digits in Myanmar', async () => {
        await changeLanguage('my')
        expect(formatNumber(12.5)).toBe('၁၂.၅၀')
        expect(formatNumber(3, 0)).toBe('၃')
    })
})

describe('buildPurchasesCsv', () => {
    test('produces header and one row per purchase', () => {
        const csv = buildPurchasesCsv([
            {
                id: 1,
                created_at: '2026-08-24 10:00:00',
                seller_name: 'U Ba',
                category: 'fruits',
                unit: 'PER KG',
                unit_price: 3000,
                quantity: 2,
                total: 6000,
            },
        ])
        const lines = csv.split('\n')
        expect(lines[0]).toBe('id,date,seller,category,unit,unit_price,quantity,total')
        expect(lines[1]).toBe('1,2026-08-24,U Ba,fruits,PER KG,3000,2,6000')
    })

    test('escapes commas and quotes in seller names', () => {
        const csv = buildPurchasesCsv([
            {
                id: 2,
                created_at: '2026-08-24 10:00:00',
                seller_name: 'Ba, "The Trader"',
                category: 'dairy',
                unit: 'PER UNIT',
                unit_price: 500,
                quantity: 1,
                total: 500,
            },
        ])
        expect(csv).toContain('"Ba, ""The Trader"""')
    })

    test('renders null seller as empty field', () => {
        const csv = buildPurchasesCsv([
            {
                id: 3,
                created_at: '2026-08-24 10:00:00',
                seller_name: null,
                category: 'grains',
                unit: 'PER BUNCH',
                unit_price: 100,
                quantity: 5,
                total: 500,
            },
        ])
        expect(csv.split('\n')[1]).toBe('3,2026-08-24,,grains,PER BUNCH,100,5,500')
    })

    test('returns only header for empty list', () => {
        expect(buildPurchasesCsv([])).toBe('id,date,seller,category,unit,unit_price,quantity,total')
    })

    test('buildPurchasesCsvWithBom prepends BOM', () => {
        const csv = buildPurchasesCsvWithBom([])
        expect(csv.charCodeAt(0)).toBe(0xfeff)
    })

    test('getCsvFilename includes prefix and date', () => {
        expect(getCsvFilename('purchases')).toMatch(/^purchases_\d{4}-\d{2}-\d{2}\.csv$/)
    })
})
