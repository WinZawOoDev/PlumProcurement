/**
 * Payment amount checks shared by RecordPayment and PaymentReview.
 * Money is compared in whole cents so float noise (e.g. 119.99999999) cannot
 * reject a valid amount.
 */

const toCents = (value: number): number => Math.round(value * 100)

/** True for a finite amount strictly greater than zero (NaN is rejected). */
export const isPositiveAmount = (amount: number): boolean => Number.isFinite(amount) && amount > 0

/** True when paying `amount` would exceed the outstanding `balance`. */
export const exceedsBalance = (amount: number, balance: number): boolean => toCents(amount) > toCents(balance)
