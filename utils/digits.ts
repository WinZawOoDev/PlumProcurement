/**
 * Myanmar (Burmese) digit conversion helpers.
 *
 * These are intentionally dependency-free: `i18n` imports them, so they must
 * not import anything back (avoids a circular module dependency).
 */

const MYANMAR_DIGITS = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉']

/** Converts Western digits (0-9) in a value to Myanmar digits (၀-၉). */
export function toMyanmarDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => MYANMAR_DIGITS[Number(digit)])
}

/** Converts Myanmar digits (၀-၉) in a string back to Western digits (0-9). */
export function toWesternDigits(value: string): string {
  return value.replace(/[၀-၉]/g, (digit) => String(digit.charCodeAt(0) - 0x1040))
}
