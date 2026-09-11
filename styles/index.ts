import { useMemo } from 'react'
import { useTheme, type ThemeOptions } from '@rneui/themed'
import { useLanguage } from '../context/LanguageContext'
import { sharedStyles } from './sharedStyles'
import { onboardingStyles } from './onboardingStyles'
import { pricingStyles } from './pricingStyles'
import { purchasingStyles } from './purchasingStyles'
import { sellerStyles } from './sellerStyles'
import { settingsStyles } from './settingsStyles'
import { MYANMAR_FONT_FAMILY, MYANMAR_FONT_FAMILY_BOLD, isBoldWeight } from './fonts'

const createStyles = (theme: ThemeOptions) => ({
    ...sharedStyles(theme),
    ...onboardingStyles(theme),
    ...pricingStyles(theme),
    ...purchasingStyles(theme),
    ...sellerStyles(theme),
    ...settingsStyles(theme),
})

type Styles = ReturnType<typeof createStyles>

/**
 * Swaps the (unbundled) Latin font families for the bundled Noto Sans Myanmar
 * face so Burmese text renders correctly. Bold styles pick the bold face.
 */
const withMyanmarFont = (styles: Styles): Styles => {
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(styles)) {
        const value = (styles as Record<string, unknown>)[key]
        if (value && typeof value === 'object' && 'fontFamily' in value) {
            result[key] = {
                ...(value as Record<string, unknown>),
                fontFamily: isBoldWeight((value as Record<string, unknown>).fontWeight)
                    ? MYANMAR_FONT_FAMILY_BOLD
                    : MYANMAR_FONT_FAMILY,
            }
        } else {
            result[key] = value
        }
    }
    return result as Styles
}

/**
 * Theme-aware styles hook. Composes the per-domain style factories and
 * memoizes the result per theme (and language) so components get stable style
 * objects.
 */
export const useStyles = () => {
    const { theme } = useTheme()
    const { language } = useLanguage()
    return useMemo(() => {
        const styles = createStyles(theme)
        return language === 'my' ? withMyanmarFont(styles) : styles
    }, [theme, language])
}
