import React from 'react'
import { View, Text as RNText } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../styles'
import { useTheme } from '@rneui/themed'

interface EmptyStateProps {
    icon: string
    title: string
    description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
    const styles = useStyles()
    const { theme } = useTheme()
    return (
        <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIconCircle}>
                <Ionicons name={icon as any} size={42} color={theme.colors.grey3} />
            </View>
            <RNText style={styles.emptyStateTitle}>{title}</RNText>
            {!!description && <RNText style={styles.emptyStateDescription}>{description}</RNText>}
        </View>
    )
}
