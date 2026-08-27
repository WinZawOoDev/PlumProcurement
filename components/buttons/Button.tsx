import React from 'react'
import { Button, ButtonProps } from '@rneui/themed'
import { ViewStyle } from 'react-native'
import { useStyles } from '../../styles'

interface PrimaryButtonProps extends Omit<ButtonProps, 'buttonStyle' | 'containerStyle' | 'titleStyle'> {
    title: string
    onPress?: () => void
    disabled?: boolean
    containerStyle?: ViewStyle
}

export function PrimaryButton({ title, onPress, disabled, containerStyle, ...props }: PrimaryButtonProps) {
    const styles = useStyles()

    return (
        <Button
            {...(props as any)}
            title={title}
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={title}
            containerStyle={{
                ...styles.raisedButtonContainer,
                ...containerStyle,
            }}
            buttonStyle={styles.primaryButton}
            titleStyle={styles.primaryButtonTitle}
        />
    )
}

interface SecondaryButtonProps extends Omit<ButtonProps, 'buttonStyle' | 'containerStyle' | 'titleStyle'> {
    title: string
    onPress?: () => void
    disabled?: boolean
    containerStyle?: ViewStyle
}

export function SecondaryButton({ title, onPress, disabled, containerStyle, ...props }: SecondaryButtonProps) {
    const styles = useStyles()

    return (
        <Button
            {...(props as any)}
            title={title}
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={title}
            containerStyle={{
                ...styles.raisedButtonContainer,
                ...containerStyle,
            }}
            buttonStyle={styles.secondaryButton}
            titleStyle={styles.secondaryButtonTitle}
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

    return (
        <Button
            {...(props as any)}
            icon={icon ?? undefined}
            title={title}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={title ?? (props as any).accessibilityLabel}
            containerStyle={styles.raisedButtonContainer}
            buttonStyle={[
                hasTitle ? styles.primaryButton : styles.iconButtonBase,
                !hasTitle && (isSmall ? styles.iconButtonSmall : styles.iconButtonCompact),
                hasTitle && isPrimary ? styles.iconButtonPrimary : null,
                !hasTitle && isGhost ? styles.iconButtonGhost : !hasTitle && !isPrimary ? styles.iconButtonSecondary : null,
                !hasTitle && isPrimary ? styles.iconButtonPrimary : null,
            ].filter(Boolean)}
            titleStyle={hasTitle ? styles.iconButtonTitlePrimary : isPrimary ? styles.iconButtonTitlePrimary : styles.iconButtonTitleSecondary}
        />
    )
}
