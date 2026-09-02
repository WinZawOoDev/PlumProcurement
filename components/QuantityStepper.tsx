import React from 'react'
import { View, Text as RNText, Vibration, TouchableOpacity } from 'react-native'
import { Text } from '@rneui/themed'
import { useStyles } from '../styles'
import { UI_TEXT, A11Y_LABELS } from '../constants'

const lightHaptic = () => {
    try {
        Vibration.vibrate(10)
    } catch {
        // Vibration not available/permitted on this device — ignore
    }
}

interface QuantityStepperProps {
    value: string
    onChange: (next: string) => void
    disabled?: boolean
}

export function QuantityStepper({ value, onChange, disabled = false }: QuantityStepperProps) {
    const styles = useStyles()
    const handleIncrease = () => {
        if (disabled) return
        lightHaptic()
        onChange(String(Math.max(1, (parseInt(value, 10) || 1) + 1)))
    }
    const handleDecrease = () => {
        if (disabled) return
        lightHaptic()
        onChange(String(Math.max(1, (parseInt(value, 10) || 1) - 1)))
    }
    return (
        <View style={styles.quantityRow}>
            <Text style={styles.categoryLabel}>{UI_TEXT.QUANTITY}</Text>
            <TouchableOpacity
                style={[styles.quantityStepperButton, disabled && styles.quantityStepperButtonDisabled]}
                onPress={handleIncrease}
                disabled={disabled}
                activeOpacity={0.6}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={A11Y_LABELS.INCREASE_QUANTITY}
                accessibilityState={{ disabled }}
            >
                <RNText style={[styles.quantityStepperButtonText, disabled && styles.quantityStepperTextDisabled]}>+</RNText>
            </TouchableOpacity>
            <RNText style={[styles.quantityValue, disabled && styles.quantityStepperTextDisabled]}>{value}</RNText>
            <TouchableOpacity
                style={[styles.quantityStepperButton, disabled && styles.quantityStepperButtonDisabled]}
                onPress={handleDecrease}
                disabled={disabled}
                activeOpacity={0.6}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={A11Y_LABELS.DECREASE_QUANTITY}
                accessibilityState={{ disabled }}
            >
                <RNText style={[styles.quantityStepperButtonText, disabled && styles.quantityStepperTextDisabled]}>−</RNText>
            </TouchableOpacity>
        </View>
    )
}
