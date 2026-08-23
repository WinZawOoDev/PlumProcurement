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
    variant?: 'primary' | 'secondary'
}

export function IconButton({ title, icon, onPress, variant = 'primary', ...props }: IconButtonProps) {
    const styles = useStyles()
    const isPrimary = variant === 'primary'

    return (
        <Button
            {...(props as any)}
            icon={icon ?? undefined}
            title={title}
            onPress={onPress}
            containerStyle={styles.raisedButtonContainer}
            buttonStyle={[
                styles.iconButtonBase,
                isPrimary ? styles.iconButtonPrimary : styles.iconButtonSecondary,
            ]}
            titleStyle={isPrimary ? styles.iconButtonTitlePrimary : styles.iconButtonTitleSecondary}
        />
    )
}
