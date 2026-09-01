import React from 'react'
import { View, Text as RNText } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../styles'
import { useTheme } from '@rneui/themed'

interface SectionHeaderProps {
    icon?: string
    title: string
    description?: string
    action?: React.ReactNode
}

export function SectionHeader({ icon, title, description, action }: SectionHeaderProps) {
    const styles = useStyles()
    const { theme } = useTheme()
    return (
        <View style={styles.sectionHeaderContainer}>
            <View style={styles.sectionHeaderTextBlock}>
                <View style={styles.sectionHeaderTitleRow}>
                    {!!icon && <Ionicons name={icon as any} size={22} color={theme.colors.primary} />}
                    <RNText style={styles.sectionHeaderTitle}>{title}</RNText>
                </View>
                {!!description && <RNText style={styles.sectionHeaderDescription}>{description}</RNText>}
            </View>
            {!!action && <View>{action}</View>}
        </View>
    )
}
