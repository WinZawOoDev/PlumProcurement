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

function csvEscape(value: unknown): string {
    const str = String(value ?? '')
    if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

/**
 * Build CSV text from purchase records
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
