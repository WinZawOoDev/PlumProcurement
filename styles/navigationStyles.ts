import { StyleSheet } from 'react-native'
import { MYANMAR_FONT_FAMILY_BOLD } from './fonts'

/**
 * Static tab-bar styles. Kept theme-independent (like the navigator itself) so
 * switching light/dark never recreates the navigator; colors come from the
 * navigation theme.
 */
export const navigationStyles = StyleSheet.create({
    tabBar: {
        minHeight: 68,
        paddingTop: 6,
        paddingBottom: 6,
        alignItems: 'center',
        borderTopWidth: 0.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    tabBarLabel: {
        fontWeight: '700',
        fontSize: 11,
        letterSpacing: 0.3,
        marginTop: 2,
    },
    tabBarIcon: {
        marginTop: 2,
    },
    tabLabel: {
        fontWeight: '700',
        fontSize: 11,
        letterSpacing: 0.3,
        marginTop: 2,
    },
    tabLabelMyanmar: {
        fontFamily: MYANMAR_FONT_FAMILY_BOLD,
    },
    // Letter-spacing breaks Myanmar shaping, so it is dropped alongside the
    // font swap (mirrors the useStyles() Myanmar pass).
    tabLabelMyanmarSpacing: {
        letterSpacing: 0,
    },
})
