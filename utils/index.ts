/**
 * Utility functions for common operations
 */

/**
 * Format price value to 2 decimal places
 */
export function formatPrice(price: number | string): string {
    const num = typeof price === 'string' ? parseFloat(price) : price
    return num.toFixed(2)
}

/**
 * Parse price string to number
 */
export function parsePrice(price: string): number {
    return parseFloat(price) || 0
}

/**
 * Validate price value
 */
export function isValidPrice(price: string | number): boolean {
    const num = typeof price === 'string' ? parseFloat(price) : price
    return !isNaN(num) && num > 0
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert camelCase to Title Case
 */
export function toTitleCase(str: string): string {
    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (char) => char.toUpperCase())
        .trim()
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            if (timeout !== null) clearTimeout(timeout)
            func(...args)
            timeout = null
        }

        if (timeout !== null) clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => {
                inThrottle = false
            }, limit)
        }
    }
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: any): boolean {
    return !obj || Object.keys(obj).length === 0
}

/**
 * Extract YYYY-MM-DD from a SQLite datetime string
 */
export function formatDate(value?: string | null): string {
    if (!value) return ''
    return value.slice(0, 10)
}

export { showSuccess, showError, getErrorMessage } from './notifications'

function csvEscape(value: unknown): string {
    const str = String(value ?? '')
    if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

/**
 * Build CSV text from purchase records
 * Includes BOM for Excel compatibility and handles empty lists gracefully.
 */
export function buildPurchasesCsv(
    purchases: Array<{
        id: number
        created_at?: string | null
        seller_name?: string | null
        category: string
        unit: string
        unit_price: number
        quantity: number
        total: number
    }>
): string {
    const header = ['id', 'date', 'seller', 'category', 'unit', 'unit_price', 'quantity', 'total']
    if (purchases.length === 0) {
        return header.join(',')
    }
    const rows = purchases.map((p) =>
        [
            p.id,
            formatDate(p.created_at),
            p.seller_name ?? '',
            p.category,
            p.unit,
            p.unit_price,
            p.quantity,
            p.total,
        ]
            .map(csvEscape)
            .join(',')
    )
    return [header.join(','), ...rows].join('\n')
}

export function buildPurchasesCsvWithBom(purchases: Parameters<typeof buildPurchasesCsv>[0]): string {
    return '\uFEFF' + buildPurchasesCsv(purchases)
}

/**
 * Build CSV text from price records
 */
export function buildPricesCsv(
    prices: Array<{
        id: number
        category: string
        unit: string
        price: number
        is_available: boolean | number | null
        created_at?: string | null
    }>
): string {
    const header = ['id', 'date', 'category', 'unit', 'price', 'available']
    if (prices.length === 0) {
        return header.join(',')
    }
    const rows = prices.map((p) =>
        [p.id, formatDate(p.created_at), p.category, p.unit, p.price, p.is_available ? 1 : 0]
            .map(csvEscape)
            .join(',')
    )
    return [header.join(','), ...rows].join('\n')
}

export function buildPricesCsvWithBom(prices: Parameters<typeof buildPricesCsv>[0]): string {
    return '\uFEFF' + buildPricesCsv(prices)
}

/**
 * Build CSV text from seller records
 */
export function buildSellersCsv(
    sellers: Array<{
        id: number
        name: string
        phone: string | null
        address: string | null
    }>
): string {
    const header = ['id', 'name', 'phone', 'address']
    if (sellers.length === 0) {
        return header.join(',')
    }
    const rows = sellers.map((s) =>
        [s.id, s.name, s.phone ?? '', s.address ?? ''].map(csvEscape).join(',')
    )
    return [header.join(','), ...rows].join('\n')
}

export function buildSellersCsvWithBom(sellers: Parameters<typeof buildSellersCsv>[0]): string {
    return '\uFEFF' + buildSellersCsv(sellers)
}

export function getCsvFilename(prefix = 'purchases'): string {
    const date = new Date().toISOString().slice(0, 10)
    return `${prefix}_${date}.csv`
}
