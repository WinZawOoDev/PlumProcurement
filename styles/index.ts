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
 * Stacked Burmese glyphs need extra vertical room; 18% matches the
 * Noto Sans Myanmar metrics gap over the Latin faces it replaces.
 */
const MYANMAR_LINE_HEIGHT_SCALE = 1.18

/**
 * Swaps the (unbundled) Latin font families for the bundled Noto Sans Myanmar
 * face so Burmese text renders correctly. Bold styles pick the bold face.
 * Spacing is adjusted alongside the swap: letter-spacing is dropped (it breaks
 * Myanmar shaping) and explicit line-heights are scaled up for the taller
 * stacked glyphs. Only text styles (those declaring a fontFamily) are touched.
 */
const withMyanmarTypography = (styles: Styles): Styles => {
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(styles)) {
        const value = (styles as Record<string, unknown>)[key]
        if (value && typeof value === 'object') {
            const base = value as Record<string, unknown>
            // letterSpacing/lineHeight only affect Text, so any style declaring
            // them is a text style — even when it inherits (rather than sets)
            // its fontFamily from the RNEUI theme.
            const isTextStyle = 'fontFamily' in base || 'letterSpacing' in base || 'lineHeight' in base
            if (!isTextStyle) {
                result[key] = value
                continue
            }
            const next: Record<string, unknown> = { ...base }
            if ('fontFamily' in next) {
                next.fontFamily = isBoldWeight(base.fontWeight)
                    ? MYANMAR_FONT_FAMILY_BOLD
                    : MYANMAR_FONT_FAMILY
            }
            if ('letterSpacing' in next) {
                next.letterSpacing = 0
            }
            if (typeof next.lineHeight === 'number') {
                next.lineHeight = Math.round(next.lineHeight * MYANMAR_LINE_HEIGHT_SCALE)
            }
            result[key] = next
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
        return language === 'my' ? withMyanmarTypography(styles) : styles
    }, [theme, language])
}
