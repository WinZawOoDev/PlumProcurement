import React from 'react'
import { View, Text as RNText } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../styles'
import { useTheme } from '@rneui/themed'

interface SectionHeaderProps {
    icon?: string
    title: string
    description?: string | React.ReactNode
    action?: React.ReactNode
    compact?: boolean
}

export function SectionHeader({ icon, title, description, action, compact = false }: SectionHeaderProps) {
    const styles = useStyles()
    const { theme } = useTheme()
    return (
        <View style={styles.sectionHeaderContainer}>
            <View style={styles.sectionHeaderTextBlock}>
                <View style={styles.sectionHeaderTitleRow}>
                    {!!icon && <Ionicons name={icon as any} size={compact ? 16 : 22} color={theme.colors.primary} />}
                    <RNText style={compact ? styles.sectionHeaderTitleCompact : styles.sectionHeaderTitle}>{title}</RNText>
                </View>
                {description ? (
                    typeof description === 'string' ? (
                        <RNText style={styles.sectionHeaderDescription}>{description}</RNText>
                    ) : (
                        <View style={styles.sectionHeaderDescriptionContainer}>{description}</View>
                    )
                ) : null}
            </View>
            {!!action && <View>{action}</View>}
        </View>
    )
}
