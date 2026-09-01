import React from 'react'
import { View, Text as RNText, ActivityIndicator } from 'react-native'
import { useStyles } from '../styles'
import { useTheme } from '@rneui/themed'

export function StartupLoader() {
    const styles = useStyles()
    const { theme } = useTheme()
    return (
        <View style={styles.startupLoaderContainer}>
            <RNText style={styles.startupLoaderTitle}>Plum Procurement</RNText>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    )
}
