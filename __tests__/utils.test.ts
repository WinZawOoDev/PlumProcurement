import {
    formatPrice,
    parsePrice,
    isValidPrice,
    capitalize,
    toTitleCase,
    debounce,
    throttle,
    sleep,
    isEmpty,
    formatDate,
    buildPurchasesCsv,
    buildPurchasesCsvWithBom,
    getCsvFilename,
} from '../utils'

describe('formatPrice', () => {
    test('formats number to 2 decimals', () => {
        expect(formatPrice(10)).toBe('10.00')
        expect(formatPrice(12.5)).toBe('12.50')
    })

    test('formats numeric string to 2 decimals', () => {
        expect(formatPrice('12.5')).toBe('12.50')
    })
})

describe('parsePrice', () => {
    test('parses valid string', () => {
        expect(parsePrice('12.50')).toBe(12.5)
    })

    test('returns 0 for invalid string', () => {
        expect(parsePrice('abc')).toBe(0)
        expect(parsePrice('')).toBe(0)
    })
})

describe('isValidPrice', () => {
    test('accepts positive numbers', () => {
        expect(isValidPrice(10)).toBe(true)
        expect(isValidPrice('10.5')).toBe(true)
    })

    test('rejects zero, negatives and NaN', () => {
        expect(isValidPrice(0)).toBe(false)
        expect(isValidPrice(-1)).toBe(false)
        expect(isValidPrice('abc')).toBe(false)
    })
})

describe('capitalize', () => {
    test('capitalizes first letter', () => {
        expect(capitalize('hello')).toBe('Hello')
    })

    test('handles empty string', () => {
        expect(capitalize('')).toBe('')
    })
})

describe('toTitleCase', () => {
    test('converts camelCase to Title Case', () => {
        expect(toTitleCase('helloWorld')).toBe('Hello World')
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
})

describe('throttle', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    test('calls function immediately then blocks until limit passes', () => {
        jest.useFakeTimers({ now: 0 })
        const fn = jest.fn()
        const throttled = throttle(fn, 100)

        throttled()
        throttled()
        expect(fn).toHaveBeenCalledTimes(1)

        jest.advanceTimersByTime(100)
        throttled()
        expect(fn).toHaveBeenCalledTimes(2)
    })
})

describe('sleep', () => {
    test('resolves after given ms', async () => {
        jest.useFakeTimers()
        const promise = sleep(50)
        jest.advanceTimersByTime(50)
        await expect(promise).resolves.toBeUndefined()
        jest.useRealTimers()
    })
})

describe('isEmpty', () => {
    test('detects empty values', () => {
        expect(isEmpty({})).toBe(true)
        expect(isEmpty(null)).toBe(true)
        expect(isEmpty(undefined)).toBe(true)
    })

    test('detects non-empty objects', () => {
        expect(isEmpty({ a: 1 })).toBe(false)
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
