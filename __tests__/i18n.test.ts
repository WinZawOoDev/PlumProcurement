import i18n, { changeLanguage, normalizeLanguage, resources } from '../i18n'
import { MESSAGES, UI_TEXT } from '../constants'

describe('i18n', () => {
    afterEach(async () => {
        await changeLanguage('en')
    })

    test('registers the English and Myanmar locales', () => {
        expect(Object.keys(resources)).toEqual(['en', 'my'])
    })

    test('English translations match the source constants', () => {
        expect(i18n.t('uiText.SAVE')).toBe(UI_TEXT.SAVE)
        expect(i18n.t('uiText.SETTINGS')).toBe(UI_TEXT.SETTINGS)
        expect(i18n.t('messages.ERROR_GENERIC')).toBe(MESSAGES.ERROR_GENERIC)
        expect(i18n.t('tabs.PRICES')).toBe('Prices')
    })

    test('switches to Myanmar', async () => {
        await changeLanguage('my')
        expect(i18n.t('uiText.SAVE')).toBe('သိမ်းဆည်းရန်')
        expect(i18n.t('tabs.PRICES')).toBe('ဈေးနှုန်းများ')
        expect(i18n.t('messages.ERROR_GENERIC')).not.toBe(MESSAGES.ERROR_GENERIC)
    })

    test('interpolates values in Myanmar', async () => {
        await changeLanguage('my')
        expect(i18n.t('uiText.TOTAL_COUNT', { count: 3 })).toContain('3')
    })

    test('normalizeLanguage falls back to English for unsupported codes', () => {
        expect(normalizeLanguage('my')).toBe('my')
        expect(normalizeLanguage('en')).toBe('en')
        expect(normalizeLanguage('fr')).toBe('en')
        expect(normalizeLanguage(undefined)).toBe('en')
    })
})
