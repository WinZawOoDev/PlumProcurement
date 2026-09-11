/**
 * User-facing messages: success/error notifications and validation messages.
 */

// ===== MESSAGES =====
export const MESSAGES = {
  PRICE_SAVED_SUCCESS: 'Price saved successfully!',
  PRICE_UPDATE_SUCCESS: 'Price updated successfully!',
  PRICE_DELETE_SUCCESS: 'Price deleted successfully!',
  PURCHASE_RECORDED_SUCCESS: 'Purchase recorded successfully!',
  PURCHASE_UPDATE_SUCCESS: 'Purchase updated successfully!',
  PURCHASE_DELETE_SUCCESS: 'Purchase deleted successfully!',
  PAYMENT_RECORDED_SUCCESS: 'Payment recorded successfully!',
  PAYMENT_UPDATE_SUCCESS: 'Payment updated successfully!',
  PAYMENT_DELETE_SUCCESS: 'Payment deleted successfully!',
  SELLER_SAVED_SUCCESS: 'Seller saved successfully!',
  SELLER_UPDATE_SUCCESS: 'Seller updated successfully!',
  SELLER_DELETE_SUCCESS: 'Seller deleted successfully!',
  ERROR_PRICE_IN_USE: 'Cannot delete this price because purchases reference it.',
  ERROR_SELLER_IN_USE: 'Cannot delete this seller because purchases reference it.',
  ERROR_SELLER_HAS_PAYMENTS: 'Cannot delete this seller because payments reference it.',
  ERROR_SELECT_PRICE: 'Please select a price item first.',
  ERROR_SELECT_SELLER: 'Please select a seller first.',
  ERROR_NO_ITEMS: 'Add at least one item to record a purchase.',
  ERROR_PURCHASE_LOCKED: 'Cannot change this purchase because it has already been paid.',
  ERROR_PURCHASE_OVERPAY: 'Cannot change this purchase because the seller would be overpaid.',
  ERROR_PAYMENT_EXCEEDS_BALANCE: 'Payment exceeds the outstanding balance.',
  ERROR_INVALID_AMOUNT: 'Amount must be greater than zero.',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  ERROR_DATABASE: 'Database error occurred.',
  ERROR_INVALID_INPUT: 'Invalid input. Please check your data.',
  ERROR_INVALID_QUANTITY: 'Quantity must be a whole number greater than zero.',
  ERROR_NETWORK: 'Network error. Please check your connection.',
  EMPTY_PRICE_LIST: 'No prices available',
  LOADING: 'Loading...',
} as const;

// ===== FORM VALIDATION =====
export const VALIDATION_MESSAGES = {
  CATEGORY_REQUIRED: 'Category is required',
  UNIT_REQUIRED: 'Unit selection is required',
  PRICE_REQUIRED: 'Price is required',
  PRICE_INVALID: 'Enter a valid price (e.g. 12.50)',
  NAME_REQUIRED: 'Name is required',
  PHONE_REQUIRED: 'Phone number is required',
  ADDRESS_REQUIRED: 'Address is required',
  AMOUNT_REQUIRED: 'Amount is required',
} as const;
