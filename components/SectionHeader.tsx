import React from 'react'
import { View, Text as RNText } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../styles'
import { useTheme } from '@rneui/themed'
import { IconButton } from './buttons/Button'
import { useLocalizedConstants } from '../hooks/useLocalizedConstants'

interface SectionHeaderProps {
    icon?: string
    title: string
    description?: string | React.ReactNode
    action?: React.ReactNode
    compact?: boolean
    onBack?: () => void
}

export function SectionHeader({ icon, title, description, action, compact = false, onBack }: SectionHeaderProps) {
    const styles = useStyles()
    const { theme } = useTheme()
    const { A11Y_LABELS } = useLocalizedConstants()

    const titleStyle = onBack
        ? styles.sectionHeaderTitleWithBack
        : compact
            ? styles.sectionHeaderTitleCompact
            : styles.sectionHeaderTitle
    const descriptionStyle = onBack ? styles.sectionHeaderDescriptionWithBack : styles.sectionHeaderDescription
    const iconSize = onBack ? 18 : compact ? 16 : 22

    const textBlock = (
        <View style={styles.sectionHeaderTextBlock}>
            <View style={styles.sectionHeaderTitleRow}>
                {!!icon && <Ionicons name={icon as any} size={iconSize} color={theme.colors.primary} />}
                <RNText style={titleStyle}>{title}</RNText>
            </View>
            {description ? (
                typeof description === 'string' ? (
                    <RNText style={descriptionStyle}>{description}</RNText>
                ) : (
                    <View style={styles.sectionHeaderDescriptionContainer}>{description}</View>
                )
            ) : null}
        </View>
    )

    if (onBack) {
        return (
            <View style={[styles.sectionHeaderContainer, styles.sectionHeaderContainerWithBack]}>
                <View style={styles.sectionHeaderBackButton}>
                    <IconButton
                        small
                        icon={<Ionicons name="arrow-back" size={20} color={theme.colors.primary} />}
                        variant="ghost"
                        onPress={onBack}
                        accessibilityLabel={A11Y_LABELS.GO_BACK}
                    />
                </View>
                {textBlock}
                {!!action && <View>{action}</View>}
            </View>
        )
    }

    return (
        <View style={styles.sectionHeaderContainer}>
            {textBlock}
            {!!action && <View>{action}</View>}
        </View>
    )
}
