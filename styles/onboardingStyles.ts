import type { ThemeOptions } from '@rneui/themed'
import { StyleSheet } from 'react-native'
import { TYPOGRAPHY } from '../constants'

export const onboardingStyles = (theme: ThemeOptions) => StyleSheet.create({
    // ===== ONBOARDING =====
    onboardingContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        padding: 24,
        gap: 24,
    },
    onboardingSlides: {
        width: '100%',
    },
    onboardingSlide: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        minHeight: 260,
        paddingHorizontal: 8,
    },
    startupLoaderContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    startupLoaderOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
    startupLoaderTitle: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY_PRIMARY,
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.primary,
        letterSpacing: 0.3,
    },
    onboardingCenter: {
        alignItems: 'center',
        gap: 12,
    },
    onboardingIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary + '12',
        alignItems: 'center',
        justifyContent: 'center',
    },
    onboardingTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    onboardingDescription: {
        fontSize: 14,
        color: theme.colors.grey4,
        textAlign: 'center',
        lineHeight: 20,
    },
    onboardingDotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    onboardingDot: {
        height: 6,
        borderRadius: 3,
    },
    onboardingButtons: {
        gap: 10,
    },
})
