/**
 * Application-wide constants
 * Centralized configuration for categories, units, routes, messages, and other fixed values
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

// ===== ROUTE NAMES =====
export const ROUTES = {
  PRICE_TAB: 'Price',
  PURCHASE_TAB: 'PurchaseTab',
  SELLER_TAB: 'SellerTab',
  SETTINGS_TAB: 'SettingsTab',
  PURCHASE: 'Purchase',
  SELLER: 'Seller',
  PURCHASE_PRICE: 'PurchasePrice',
  CREATE_PRICE: 'CreatePrice',
  PURCHASE_DETAILS: 'PurchaseDetails',
  SELLERS: 'Sellers',
  SETTINGS: 'Settings',
} as const;

// ===== MESSAGES =====
export const MESSAGES = {
  PRICE_SAVED_SUCCESS: 'Price saved successfully!',
  PRICE_UPDATE_SUCCESS: 'Price updated successfully!',
  PRICE_DELETE_SUCCESS: 'Price deleted successfully!',
  PURCHASE_RECORDED_SUCCESS: 'Purchase recorded successfully!',
  PURCHASE_UPDATE_SUCCESS: 'Purchase updated successfully!',
  PURCHASE_DELETE_SUCCESS: 'Purchase deleted successfully!',
  SELLER_SAVED_SUCCESS: 'Seller saved successfully!',
  SELLER_UPDATE_SUCCESS: 'Seller updated successfully!',
  SELLER_DELETE_SUCCESS: 'Seller deleted successfully!',
  ERROR_PRICE_IN_USE: 'Cannot delete this price because purchases reference it.',
  ERROR_SELECT_PRICE: 'Please select a price item first.',
  ERROR_SELECT_SELLER: 'Please select a seller first.',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  ERROR_DATABASE: 'Database error occurred.',
  ERROR_INVALID_INPUT: 'Invalid input. Please check your data.',
  ERROR_INVALID_QUANTITY: 'Quantity must be a whole number greater than zero.',
  ERROR_NETWORK: 'Network error. Please check your connection.',
  EMPTY_PRICE_LIST: 'No prices available',
  LOADING: 'Loading...',
} as const;

// ===== UI TEXT =====
export const UI_TEXT = {
  // Common buttons
  SAVE: 'Save',
  CANCEL: 'Cancel',
  UPDATE: 'Update',
  DELETE: 'Delete',
  EDIT: 'Edit',
  ADD: 'Add New',

  // Specific buttons
  SAVE_PRICE: 'Save Price',
  ADD_NEW_PRICE: 'Add New Price',
  COUNT: 'count',

  // Form labels
  CATEGORY: 'Category',
  UNIT_SELECTION: 'Unit',
  PRICE: 'Price',
  AVAILABLE: 'Available',

  // Sections
  PRICE_MANAGEMENT: 'Price Management',
  PRICE_DESCRIPTION: 'Define and adjust market rates for plum varieties.',
  EDIT_PRICE: 'Edit Price',

  // Field names for display
  UNIT: 'Unit',
  STATUS: 'Status',
  PLUM_COUNT_TITLE: "Let's count the Plums",
  SELLERS: 'Sellers',

  // Availability
  AVAILABLE_STATUS: 'Available',
  UNAVAILABLE_STATUS: 'Unavailable',

  // Search & sort
  SEARCH_PRICES_PLACEHOLDER: 'Search by category or unit',
  SEARCH_PURCHASES_PLACEHOLDER: 'Search by category or seller',
  SEARCH_SELLERS_PLACEHOLDER: 'Search by name or phone',
  NO_MATCHING_RESULTS: 'No matching results',

  // Purchasing
  RECORD_PURCHASE: 'Record Purchase',
  PURCHASE_DESCRIPTION: 'Select a price item and record purchased quantities.',
  SELECT_PRICE_ITEM: 'Price Item',
  SELECT_SELLER: 'Seller',
  SELECT_SELLER_PLACEHOLDER: 'Select seller',
  SELECT_SELLER_AND_PRICE_FIRST: 'Select a seller and a price item to set the quantity',
  NO_SELLER: 'No seller',
  SOLD_BY: 'Sold by',
  QUANTITY: 'Quantity',
  UNIT_PRICE: 'Unit Price',
  TOTAL: 'Total',
  RECENT_PURCHASES: 'Recent Purchases',
  PURCHASE_HISTORY_TITLE: 'Purchase History',
  PURCHASE_HISTORY_DESCRIPTION: 'All recorded purchases with running totals.',
  EDIT_PURCHASE: 'Edit Purchase',
  VIEW_HISTORY: 'View History',
  EXPORT_CSV: 'Export CSV',
  EMPTY_PURCHASE_LIST: 'No purchases recorded yet',
  TOTAL_VALUE: 'Total Value',
  PURCHASES_COUNT: 'Purchases',

  // Sellers
  SELLERS_DESCRIPTION: 'Manage the sellers you buy from.',
  ADD_SELLER: 'Add Seller',
  EDIT_SELLER: 'Edit Seller',
  SELLER_NAME: 'Seller Name',
  PHONE: 'Phone (optional)',
  ADDRESS: 'Address (optional)',
  EMPTY_SELLER_LIST: 'No sellers added yet',

  // Settings
  SETTINGS: 'Settings',
  SETTINGS_DESCRIPTION: 'Personalize how the app looks and behaves.',
  THEME: 'Theme',
  THEME_MODE_SYSTEM: 'Match system',
  THEME_MODE_LIGHT: 'Light',
  THEME_MODE_DARK: 'Dark',

  // Deletion confirmations
  DELETE_CONFIRM_TITLE: 'Confirm deletion',
  DELETE_PRICE_CONFIRM_MESSAGE:
    'Delete this price? This cannot be undone.',
  DELETE_SELLER_CONFIRM_MESSAGE: 'Delete this seller? This cannot be undone.',
  DELETE_PURCHASE_CONFIRM_MESSAGE: 'Delete this purchase? This cannot be undone.',
} as const;

// ===== ACCESSIBILITY LABELS =====
export const A11Y_LABELS = {
  EDIT_PRICE: 'Edit price',
  DELETE_PRICE: 'Delete price',
  EDIT_SELLER: 'Edit seller',
  DELETE_SELLER: 'Delete seller',
  EDIT_PURCHASE: 'Edit purchase',
  DELETE_PURCHASE: 'Delete purchase',
  INCREASE_QUANTITY: 'Increase quantity',
  DECREASE_QUANTITY: 'Decrease quantity',
  CLEAR_SEARCH: 'Clear search',
  TOGGLE_SEARCH: 'Toggle search',
} as const;

export const SORT_MODES = ['default', 'price_asc', 'price_desc'] as const;
export type SortMode = (typeof SORT_MODES)[number];

// ===== DATABASE CONFIGURATION =====
export const DATABASE_CONFIG = {
  NAME: 'plum_procurement.sqlite',
  TIMEOUT: 5000,
} as const;

export const PAGINATION_CONFIG = {
  PURCHASE_PAGE_SIZE: 20,
  INITIAL_PAGE_SIZE: 20,
} as const;

// ===== FORM CONFIGURATION =====
export const FORM_CONFIG = {
  PRICE_DEFAULT: '',
  PRICE_PLACEHOLDER: 'e.g. 12.50',
  PRICE_KEYTYPE: 'decimal-pad' as const,
  UNIT_DEFAULT: 0,
  CATEGORY_DEFAULT: PRODUCT_CATEGORIES.FRUIT,
  AVAILABLE_DEFAULT: false,
} as const;

// ===== UI DIMENSIONS =====
export const DIMENSIONS = {
  BUTTON_HEIGHT: 55,
  BUTTON_PADDING_VERTICAL: 12,
  BUTTON_PADDING_HORIZONTAL: 20,
  BORDER_RADIUS_SMALL: 4,
  BORDER_RADIUS_MEDIUM: 5,
  BORDER_RADIUS_LARGE: 20,
  ICON_SIZE_SMALL: 18,
  ICON_SIZE_MEDIUM: 22,
  ICON_SIZE_LARGE: 30,
  FLAT_LIST_MARGIN_BOTTOM: 130,
  EMPTY_LIST_HEIGHT: 200,
  PLUM_COUNT_CIRCLE_SIZE: 300,
} as const;

// ===== TYPOGRAPHY =====
export const TYPOGRAPHY = {
  FONT_FAMILY_PRIMARY: 'Manrope',
  FONT_FAMILY_SECONDARY: 'Inter',
  LETTER_SPACING: 0.5,
} as const;

// ===== FORM VALIDATION =====
export const VALIDATION_MESSAGES = {
  CATEGORY_REQUIRED: 'Category is required',
  UNIT_REQUIRED: 'Unit selection is required',
  PRICE_REQUIRED: 'Price is required',
  PRICE_INVALID: 'Enter a valid price (e.g. 12.50)',
  NAME_REQUIRED: 'Name is required',
} as const;

export const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
export const QUANTITY_PATTERN = /^\d+$/;

// ===== PICKER CONFIGURATION =====
export const PICKER_CONFIG = {
  MODE: 'dialog' as const,
} as const;

// ===== ANIMATION =====
export const ANIMATIONS = {
  KEYBOARD_AVOID_BEHAVIOR: 'padding' as const,
  BOTTOM_SHEET_ANIMATION: 'slide' as const,
} as const;

// ===== SAFE AREA =====
export const SAFE_AREA = {
  EDGES: { bottom: 'maximum' } as const,
} as const;

// ===== APP SETTINGS (persisted in app_settings table) =====
export const SETTINGS_KEYS = {
  ONBOARDED: 'onboarded',
  THEME_MODE: 'theme_mode',
} as const;

export const THEME_MODES = ['system', 'light', 'dark'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

