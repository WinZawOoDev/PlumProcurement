import { __resetDbForTests, initDb } from '../database/connection'
import { __resetSchemaForTests } from '../database/schema'
import { __resetMigrationsForTests } from '../database/migrations'
import { getSetting, setSetting } from '../database/settings'
import { settingsService } from '../services/settingsService'
import { __resetInMemoryDb } from '../testHelpers/inMemorySqlite'

jest.mock('react-native-nitro-sqlite', () => require('../testHelpers/inMemorySqlite'))

beforeEach(() => {
    __resetDbForTests()
    __resetSchemaForTests()
    __resetMigrationsForTests()
    __resetInMemoryDb()
})

describe('connection singleton', () => {
    test('initDb caches the handle until reset', () => {
        const a = initDb()
        const b = initDb()
        expect(a).toBe(b)
        __resetDbForTests()
        expect(initDb()).not.toBe(a)
    })
})

describe('settings persistence (unified fake)', () => {
    test('set/get round-trips a value', async () => {
        await expect(getSetting('theme')).resolves.toBeNull()
        await setSetting('theme', 'dark')
        await expect(getSetting('theme')).resolves.toBe('dark')
    })

    test('settingsService onboarded + theme + language', async () => {
        await expect(settingsService.isOnboarded()).resolves.toBe(false)
        await settingsService.setOnboarded()
        await expect(settingsService.isOnboarded()).resolves.toBe(true)

        await expect(settingsService.getThemeMode()).resolves.toBe('system')
        await settingsService.setThemeMode('dark')
        await expect(settingsService.getThemeMode()).resolves.toBe('dark')

        await settingsService.setLanguage('my')
        await expect(settingsService.getLanguage()).resolves.toBe('my')
    })
})
