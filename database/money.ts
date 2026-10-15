/**
 * Money is stored in the database as INTEGER minor units (cents: major x 100)
 * so every sum, total and balance comparison is exact integer arithmetic.
 * Float REAL sums need no epsilon and line totals never show artifacts like
 * 0.30000000000000004.
 *
 * The public service/type boundary stays in major units (`number`, e.g. 9.99):
 * convert with `toMinor` on the way in and `fromMinor` on the way out, as
 * close to the SQL as possible. The UI and CSV layers never see minor units.
 */
export const MINOR_UNITS_PER_MAJOR = 100

/** Major units (9.99) -> integer minor units (999). Rejects non-finite input. */
export function toMinor(major: number): number {
    if (!Number.isFinite(major)) {
        throw new Error(`toMinor expects a finite number, got ${major}`)
    }
    return Math.round(major * MINOR_UNITS_PER_MAJOR)
}

/** Integer minor units (999) -> major units (9.99). */
export function fromMinor(minor: number): number {
    return (minor ?? 0) / MINOR_UNITS_PER_MAJOR
}

/** Exact line total in minor units from a major-unit price and quantity. */
export function lineTotalMinor(unitPriceMajor: number, quantity: number): number {
    return toMinor(unitPriceMajor) * quantity
}
