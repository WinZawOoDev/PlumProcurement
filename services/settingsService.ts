import { SETTINGS_KEYS } from '../constants'
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
}

export const settingsService = new SettingsService()
