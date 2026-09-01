import React from 'react'
import { View, Text as RNText, ActivityIndicator } from 'react-native'
import { useStyles } from '../styles'
import { useTheme } from '@rneui/themed'

export function StartupLoader({ overlay }: { overlay?: boolean }) {
    const styles = useStyles()
    const { theme } = useTheme()
    return (
        <View
            style={overlay ? [styles.startupLoaderContainer, styles.startupLoaderOverlay] : styles.startupLoaderContainer}
        >
            <RNText style={styles.startupLoaderTitle}>Plum Procurement</RNText>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    )
}
