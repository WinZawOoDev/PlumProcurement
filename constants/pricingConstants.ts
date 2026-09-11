/**
 * Pricing domain constants: product categories, units, price form config,
 * validation pattern and list sort modes.
 */

// ===== PRODUCT CATEGORIES =====
export const PRODUCT_CATEGORIES = {
  FRUIT: 'fruit',
  SEED: 'seed',
} as const;

export const CATEGORY_LABELS = {
  [PRODUCT_CATEGORIES.FRUIT]: 'Fruit',
  [PRODUCT_CATEGORIES.SEED]: 'Seed',
} as const;

export const CATEGORY_LIST = [
  { label: CATEGORY_LABELS[PRODUCT_CATEGORIES.FRUIT], value: PRODUCT_CATEGORIES.FRUIT },
  { label: CATEGORY_LABELS[PRODUCT_CATEGORIES.SEED], value: PRODUCT_CATEGORIES.SEED },
];

// ===== PRODUCT UNITS =====
export const PRODUCT_UNITS = {
  CUP: 'CUP',
  GALLON: 'GALLON',
  BUSHELS: 'BUSHELS',
} as const;

export const UNIT_LIST = [
  PRODUCT_UNITS.CUP,
  PRODUCT_UNITS.GALLON,
  PRODUCT_UNITS.BUSHELS,
];

// ===== FORM CONFIGURATION =====
export const FORM_CONFIG = {
  PRICE_DEFAULT: '',
  PRICE_KEYTYPE: 'decimal-pad' as const,
  UNIT_DEFAULT: 0,
  CATEGORY_DEFAULT: PRODUCT_CATEGORIES.FRUIT,
} as const;

// ===== SORT MODES =====
export const SORT_MODES = ['default', 'price_asc', 'price_desc'] as const;
export type SortMode = (typeof SORT_MODES)[number];

// ===== PRICE VALIDATION =====
export const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
