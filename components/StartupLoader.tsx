import React from 'react'
import { View, Text as RNText, ActivityIndicator } from 'react-native'
import { useStyles } from '../styles'
import { useTheme } from '@rneui/themed'
import { useLocalizedConstants } from '../hooks/useLocalizedConstants'

export function StartupLoader({ overlay }: { overlay?: boolean }) {
    const styles = useStyles()
    const { theme } = useTheme()
    const { UI_TEXT, MESSAGES } = useLocalizedConstants()
    return (
        <View
            style={overlay ? [styles.startupLoaderContainer, styles.startupLoaderOverlay] : styles.startupLoaderContainer}
        >
            <RNText style={styles.startupLoaderTitle}>{UI_TEXT.APP_NAME}</RNText>
            <ActivityIndicator size="large" color={theme.colors.primary} accessibilityLabel={MESSAGES.LOADING} />
        </View>
    )
}
