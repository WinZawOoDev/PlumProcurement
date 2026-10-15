import type { CreateThemeOptions } from '@rneui/themed'
import { StyleSheet } from 'react-native'
import { MYANMAR_FONT_FAMILY, MYANMAR_FONT_FAMILY_BOLD } from './fonts'

/**
 * Styles for the crash / startup-failure fallback. Built from the raw
 * `createTheme` options (not the resolved provider theme) because the
 * fallback can render outside the app's ThemeProvider.
 */
export const errorFallbackStyles = (options: CreateThemeOptions, isDark: boolean) => {
    const palette = isDark ? options.darkColors : options.lightColors
    const colors = {
        background: palette?.background ?? (isDark ? '#0F0F12' : '#FDFCFB'),
        primary: palette?.primary ?? (isDark ? '#E2B5D0' : '#5B2A4A'),
        black: palette?.black ?? (isDark ? '#F0F0F0' : '#1C1C1E'),
        white: palette?.white ?? (isDark ? '#1A1A1E' : '#FFFFFF'),
    }
    return StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        padding: 24,
        gap: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
    },
    message: {
        fontSize: 14,
        color: colors.black,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 8,
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 24,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    retryText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '700',
    },
    myanmar: {
        fontFamily: MYANMAR_FONT_FAMILY,
    },
    myanmarBold: {
        fontFamily: MYANMAR_FONT_FAMILY_BOLD,
    },
    })
}
