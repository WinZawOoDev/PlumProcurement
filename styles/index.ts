import { useMemo } from 'react'
import { useTheme, type ThemeOptions } from '@rneui/themed'
import { sharedStyles } from './sharedStyles'
import { onboardingStyles } from './onboardingStyles'
import { pricingStyles } from './pricingStyles'
import { purchasingStyles } from './purchasingStyles'
import { sellerStyles } from './sellerStyles'
import { settingsStyles } from './settingsStyles'

const createStyles = (theme: ThemeOptions) => ({
    ...sharedStyles(theme),
    ...onboardingStyles(theme),
    ...pricingStyles(theme),
    ...purchasingStyles(theme),
    ...sellerStyles(theme),
    ...settingsStyles(theme),
})

/**
 * Theme-aware styles hook. Composes the per-domain style factories and
 * memoizes the result per theme so components get stable style objects.
 */
export const useStyles = () => {
    const { theme } = useTheme()
    return useMemo(() => createStyles(theme), [theme])
}
