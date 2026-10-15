import React, { useMemo } from 'react'
import { Pressable, Text as RNText, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { makeAppTheme } from '../theme'
import { errorFallbackStyles } from '../styles/errorFallbackStyles'
import { useLocalizedConstants } from '../hooks/useLocalizedConstants'

interface ErrorFallbackProps {
    /** User-safe explanation of what failed. */
    message: string
    /**
     * Explicit because the fallback can render above the app's ThemeProvider
     * (e.g. ErrorBoundary wraps the provider), so it cannot rely on context.
     */
    isDarkMode: boolean
    onRetry: () => void
}

/** Full-screen error state with a retry action. Shared by ErrorBoundary and startup. */
export function ErrorFallback({ message, isDarkMode, onRetry }: ErrorFallbackProps) {
    const options = useMemo(() => makeAppTheme(isDarkMode), [isDarkMode])
    const { i18n } = useTranslation()
    const { UI_TEXT } = useLocalizedConstants()
    const isMyanmar = i18n.language === 'my'
    const styles = useMemo(() => errorFallbackStyles(options, isDarkMode, isMyanmar), [options, isDarkMode, isMyanmar])

    return (
        <View style={styles.container}>
            <RNText style={[styles.title, isMyanmar && styles.myanmarBold]}>
                {UI_TEXT.SOMETHING_WENT_WRONG}
            </RNText>
            <RNText style={[styles.message, isMyanmar && styles.myanmar]}>{message}</RNText>
            <Pressable
                onPress={onRetry}
                accessibilityRole="button"
                accessibilityLabel={UI_TEXT.RETRY}
                testID="error-retry"
                style={styles.retryButton}
            >
                <RNText style={[styles.retryText, isMyanmar && styles.myanmarBold]}>{UI_TEXT.RETRY}</RNText>
            </Pressable>
        </View>
    )
}
