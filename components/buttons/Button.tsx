import React from 'react'
import { Button, ButtonProps } from '@rneui/themed'
import { ViewStyle } from 'react-native'
import { useStyles } from '../../styles'
import { lightHaptic } from '../../utils/haptics'

interface PrimaryButtonProps extends Omit<ButtonProps, 'buttonStyle' | 'containerStyle' | 'titleStyle'> {
    title: string
    onPress?: () => void
    disabled?: boolean
    containerStyle?: ViewStyle
    compact?: boolean
    buttonStyle?: ViewStyle
    titleStyle?: any
}

export function PrimaryButton({ title, onPress, disabled, containerStyle, compact = false, buttonStyle, titleStyle, ...props }: PrimaryButtonProps) {
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
            accessibilityRole="button"
            accessibilityLabel={title}
            containerStyle={{
                ...styles.raisedButtonContainer,
                ...(compact ? styles.raisedButtonContainerCompact : null),
                ...containerStyle,
            }}
            buttonStyle={{
                ...(compact ? styles.primaryButtonCompact : styles.primaryButton),
                ...buttonStyle,
            }}
            titleStyle={{
                ...(compact ? styles.primaryButtonTitleCompact : styles.primaryButtonTitle),
                ...titleStyle,
            }}
        />
    )
}

interface SecondaryButtonProps extends Omit<ButtonProps, 'buttonStyle' | 'containerStyle' | 'titleStyle'> {
    title: string
    onPress?: () => void
    disabled?: boolean
    containerStyle?: ViewStyle
    buttonStyle?: ViewStyle
    titleStyle?: any
}

export function SecondaryButton({ title, onPress, disabled, containerStyle, buttonStyle, titleStyle, ...props }: SecondaryButtonProps) {
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
            accessibilityRole="button"
            accessibilityLabel={title}
            containerStyle={{
                ...styles.raisedButtonContainer,
                ...containerStyle,
            }}
            buttonStyle={{ ...styles.secondaryButton, ...buttonStyle }}
            titleStyle={{ ...styles.secondaryButtonTitle, ...(titleStyle as any) }}
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
