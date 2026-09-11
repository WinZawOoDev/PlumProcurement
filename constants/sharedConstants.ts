/**
 * Cross-cutting constants used across multiple domains.
 * Layout dimensions, typography, animation, safe-area and database tuning.
 */

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

// ===== PAGINATION =====
export const PAGINATION_CONFIG = {
  PURCHASE_PAGE_SIZE: 20,
  INITIAL_PAGE_SIZE: 20,
  RECENT_PURCHASES_LIMIT: 4,
  RECENT_SELLER_ITEMS_LIMIT: 3,
} as const;

// ===== DATABASE CONFIGURATION =====
export const DATABASE_CONFIG = {
  NAME: 'plum_procurement.sqlite',
  TIMEOUT: 5000,
} as const;
