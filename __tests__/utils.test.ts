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
