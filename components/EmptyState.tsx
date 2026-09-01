import React from 'react'
import { View, Text as RNText } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../styles'
import { useTheme } from '@rneui/themed'

interface EmptyStateProps {
    icon: string
    title: string
    description?: string
    compact?: boolean
}

export function EmptyState({ icon, title, description, compact }: EmptyStateProps) {
    const styles = useStyles()
    const { theme } = useTheme()
    return (
        <View style={compact ? styles.emptyStateContainerCompact : styles.emptyStateContainer}>
            <View style={compact ? styles.emptyStateIconCircleCompact : styles.emptyStateIconCircle}>
                <Ionicons name={icon as any} size={compact ? 28 : 42} color={theme.colors.grey3} />
            </View>
            <RNText style={styles.emptyStateTitle}>{title}</RNText>
            {!!description && <RNText style={styles.emptyStateDescription}>{description}</RNText>}
        </View>
    )
}
