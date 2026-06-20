import React from 'react'
import { Button, ButtonProps, useTheme } from '@rneui/themed'
import { ViewStyle } from 'react-native'

interface PrimaryButtonProps extends Omit<ButtonProps, 'buttonStyle' | 'containerStyle' | 'titleStyle'> {
    title: string
    onPress?: () => void
    disabled?: boolean
    containerStyle?: ViewStyle
}

export function PrimaryButton({ title, onPress, disabled, containerStyle, ...props }: PrimaryButtonProps) {
    const { theme } = useTheme()

    return (
        <Button
            {...(props as any)}
            title={title}
            onPress={onPress}
            disabled={disabled}
            containerStyle={{
                shadowColor: 'transparent',
                elevation: 0,
                shadowOpacity: 0,
                ...containerStyle,
            }}
            buttonStyle={{
                backgroundColor: theme.colors.primary,
                borderRadius: 5,
                paddingVertical: 12,
            }}
            titleStyle={{
                color: theme.colors.white,
                fontWeight: 'bold',
                fontSize: 16,
            }}
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
    const { theme } = useTheme()

    return (
        <Button
            {...(props as any)}
            title={title}
            onPress={onPress}
            disabled={disabled}
            containerStyle={{
                shadowColor: 'transparent',
                elevation: 0,
                shadowOpacity: 0,
                ...containerStyle,
            }}
            buttonStyle={{
                backgroundColor: theme.colors.neutral,
                borderRadius: 5,
                paddingVertical: 12,
                borderWidth: 0.5,
                borderColor: theme.colors.primary,
            }}
            titleStyle={{
                color: theme.colors.primary,
                fontWeight: 'bold',
                fontSize: 16,
            }}
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
    const { theme } = useTheme()

    const isPrimary = variant === 'primary'

    return (
        <Button
            {...(props as any)}
            icon={icon ?? undefined}
            title={title}
            onPress={onPress}
            containerStyle={{
                shadowColor: 'transparent',
            }}
            buttonStyle={{
                display: 'flex',
                justifyContent: 'flex-start',
                paddingHorizontal: 20,
                paddingBlock: 12,
                borderRadius: 4,
                backgroundColor: isPrimary ? theme.colors.primary : theme.colors.neutral,
                elevation: 0,
                shadowOpacity: 0,
                borderWidth: 0,
            }}
            titleStyle={{
                fontWeight: '600',
                fontSize: 17,
                lineHeight: 20,
                fontFamily: 'Inter',
                color: isPrimary ? 'white' : theme.colors.primary,
                marginLeft: 10,
            }}
        />
    )
}
