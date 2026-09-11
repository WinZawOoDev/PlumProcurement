/**
 * Settings domain constants: persisted app setting keys and theme modes.
 */

// ===== APP SETTINGS (persisted in app_settings table) =====
export const SETTINGS_KEYS = {
  ONBOARDED: 'onboarded',
  THEME_MODE: 'theme_mode',
} as const;

// ===== THEME MODES =====
export const THEME_MODES = ['system', 'light', 'dark'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];
