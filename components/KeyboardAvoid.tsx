import React from 'react'
import { KeyboardAvoidingView, Platform, StyleProp, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ANIMATIONS } from '../constants'

interface KeyboardAvoidProps {
    children: React.ReactNode
    style?: StyleProp<ViewStyle>
}

/**
 * Shared keyboard-avoiding wrapper. Pads on iOS (offset by the top safe area so
 * the in-screen header isn't pushed) and resizes on Android. Use around form
 * screens that pin their actions to the bottom.
 */
export function KeyboardAvoid({ children, style }: KeyboardAvoidProps) {
    const insets = useSafeAreaInsets()
    return (
        <KeyboardAvoidingView
            style={style}
            behavior={Platform.OS === 'ios' ? ANIMATIONS.KEYBOARD_AVOID_BEHAVIOR : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        >
            {children}
        </KeyboardAvoidingView>
    )
}

export default KeyboardAvoid
