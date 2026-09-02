import { SETTINGS_KEYS, THEME_MODES, ThemeMode } from '../constants'
import { getSetting, initializeSettings, setSetting } from '../database/settings'

/**
 * Abstraction layer over the app_settings table.
 */
export class SettingsService {
    async isOnboarded(): Promise<boolean> {
        await initializeSettings()
        return (await getSetting(SETTINGS_KEYS.ONBOARDED)) === '1'
    }

    async setOnboarded(): Promise<void> {
        await initializeSettings()
        await setSetting(SETTINGS_KEYS.ONBOARDED, '1')
    }

    async getThemeMode(): Promise<ThemeMode> {
        await initializeSettings()
        const stored = await getSetting(SETTINGS_KEYS.THEME_MODE)
        return THEME_MODES.includes(stored as ThemeMode) ? (stored as ThemeMode) : 'system'
    }

    async setThemeMode(mode: ThemeMode): Promise<void> {
        await initializeSettings()
        await setSetting(SETTINGS_KEYS.THEME_MODE, mode)
    }
}

export const settingsService = new SettingsService()
