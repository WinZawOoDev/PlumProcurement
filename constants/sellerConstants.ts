/**
 * Seller domain constants: payment methods and amount validation.
 */

// ===== PAYMENT METHODS =====
export const PAYMENT_METHODS = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank transfer', value: 'bank' },
  { label: 'Mobile money', value: 'mobile' },
] as const;

// ===== AMOUNT VALIDATION =====
export const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

// ===== PAYMENT HISTORY PAGINATION =====
/** Page size for a seller's payment history (keyset-paginated). */
export const PAYMENT_HISTORY_PAGE_SIZE = 20;
