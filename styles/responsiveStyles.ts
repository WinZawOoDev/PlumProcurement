import type { ThemeOptions } from '@rneui/themed'
import { StyleSheet } from 'react-native'
import { RESPONSIVE } from '../hooks/useOrientation'

/**
 * Orientation-agnostic responsive styles. Screens combine these with the
 * per-domain factories via useStyles() and pick portrait/landscape variants
 * with the useOrientation() hook — no Dimensions listeners per screen.
 */
export const responsiveStyles = (theme: ThemeOptions) =>
    StyleSheet.create({
        // Centers column content and caps line length on wide/landscape
        // screens. Apply to the inner container inside the full-bleed screen.
        responsiveContent: {
            width: '100%',
            maxWidth: RESPONSIVE.MAX_CONTENT_WIDTH_PORTRAIT,
            alignSelf: 'center',
            flex: 1,
        },
        responsiveContentLandscape: {
            maxWidth: RESPONSIVE.MAX_CONTENT_WIDTH_LANDSCAPE,
        },
        // Full-bleed screen wrapper that works in both orientations: flex
        // instead of height 100% so short landscape heights don't clip.
        responsiveScreen: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        // Two-column grid helpers for FlatLists (columnWrapperStyle + item).
        responsiveGridRow: {
            gap: 12,
        },
        responsiveGridColumn: {
            flex: 1,
        },
        // Side-by-side panels on landscape (e.g. purchases + payments).
        responsiveTwoPane: {
            flexDirection: 'row',
            gap: 16,
            alignItems: 'flex-start',
        },
        responsiveTwoPaneColumn: {
            flex: 1,
            minWidth: 0,
        },
        // Onboarding + form actions go horizontal when width allows.
        responsiveActionsRow: {
            flexDirection: 'row',
            gap: 12,
        },
        responsiveActionsRowItem: {
            flex: 1,
        },
        responsiveOnboardingLandscape: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 24,
        },
        responsiveOnboardingSlidesLandscape: {
            flex: 1,
        },
        responsiveOnboardingPaneLandscape: {
            flex: 1,
            gap: 12,
        },
        responsiveTwoPaneColumnGap: {
            gap: 12,
        },
    })
