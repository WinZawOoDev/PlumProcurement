import React from 'react'
import { Button, ButtonProps } from '@rneui/themed'
import { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { useStyles } from '../../styles'
import { lightHaptic } from '../../utils/haptics'

// Stable fallback ids. They must not come from the localized title: a
// locale-dependent selector would break when the app language changes.
const PRIMARY_TEST_ID = 'btn-primary'
const SECONDARY_TEST_ID = 'btn-secondary'

interface PrimaryButtonProps extends Omit<ButtonProps, 'buttonStyle' | 'containerStyle' | 'titleStyle'> {
    title: string
    onPress?: () => void
    disabled?: boolean
    containerStyle?: StyleProp<ViewStyle>
    compact?: boolean
    buttonStyle?: StyleProp<ViewStyle>
    titleStyle?: StyleProp<TextStyle>
    testID?: string
}

export function PrimaryButton({ title, onPress, disabled, containerStyle, compact = false, buttonStyle, titleStyle, testID, ...props }: PrimaryButtonProps) {
    const styles = useStyles()
    const handlePress = () => {
        if (!disabled) lightHaptic()
        onPress?.()
    }
    return (
        <Button
            {...(props as any)}
            title={title}
            onPress={handlePress}
            disabled={disabled}
            testID={testID ?? PRIMARY_TEST_ID}
            accessibilityRole="button"
            accessibilityLabel={title}
            containerStyle={[
                styles.raisedButtonContainer,
                compact && styles.raisedButtonContainerCompact,
                containerStyle,
            ]}
            buttonStyle={[
                compact ? styles.primaryButtonCompact : styles.primaryButton,
                buttonStyle,
            ]}
            titleStyle={[
                compact ? styles.primaryButtonTitleCompact : styles.primaryButtonTitle,
                titleStyle,
            ]}
        />
    )
}

interface SecondaryButtonProps extends Omit<ButtonProps, 'buttonStyle' | 'containerStyle' | 'titleStyle'> {
    title: string
    onPress?: () => void
    disabled?: boolean
    containerStyle?: StyleProp<ViewStyle>
    buttonStyle?: StyleProp<ViewStyle>
    titleStyle?: StyleProp<TextStyle>
    testID?: string
}

export function SecondaryButton({ title, onPress, disabled, containerStyle, buttonStyle, titleStyle, testID, ...props }: SecondaryButtonProps) {
    const styles = useStyles()
    const handlePress = () => {
        if (!disabled) lightHaptic()
        onPress?.()
    }
    return (
        <Button
            {...(props as any)}
            title={title}
            onPress={handlePress}
            disabled={disabled}
            testID={testID ?? SECONDARY_TEST_ID}
            accessibilityRole="button"
            accessibilityLabel={title}
            containerStyle={[styles.raisedButtonContainer, containerStyle]}
            buttonStyle={[styles.secondaryButton, buttonStyle]}
            titleStyle={[styles.secondaryButtonTitle, titleStyle]}
        />
    )
}

interface IconButtonProps extends Omit<ButtonProps, 'buttonStyle' | 'containerStyle' | 'titleStyle'> {
    title?: string
    icon?: any
    onPress?: () => void
    variant?: 'primary' | 'secondary' | 'ghost'
    small?: boolean
}

export function IconButton({ title, icon, onPress, variant = 'primary', small = false, ...props }: IconButtonProps) {
    const styles = useStyles()
    const hasTitle = !!title
    const isPrimary = variant === 'primary'
    const isGhost = variant === 'ghost'
    const isSmall = small
    const handlePress = () => {
        lightHaptic()
        onPress?.()
    }

    return (
        <Button
            {...(props as any)}
            icon={icon ?? undefined}
            title={title}
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel={title ?? (props as any).accessibilityLabel}
            containerStyle={styles.raisedButtonContainer}
            buttonStyle={[
                hasTitle
                    ? isSmall
                        ? styles.primaryButtonCompact
                        : styles.primaryButton
                    : styles.iconButtonBase,
                !hasTitle && (isSmall ? styles.iconButtonSmall : styles.iconButtonCompact),
                hasTitle && isPrimary ? styles.iconButtonPrimary : null,
                !hasTitle && isGhost ? styles.iconButtonGhost : !hasTitle && !isPrimary ? styles.iconButtonSecondary : null,
                !hasTitle && isPrimary ? styles.iconButtonPrimary : null,
            ].filter(Boolean)}
            titleStyle={
                hasTitle
                    ? isSmall
                        ? styles.primaryButtonTitleCompact
                        : styles.iconButtonTitlePrimary
                    : isPrimary
                        ? styles.iconButtonTitlePrimary
                        : styles.iconButtonTitleSecondary
            }
        />
    )
}
