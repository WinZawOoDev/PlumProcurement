import React from 'react'
import { View, Text as RNText, Vibration } from 'react-native'
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
}

export function QuantityStepper({ value, onChange }: QuantityStepperProps) {
    const styles = useStyles()
    const handleIncrease = () => {
        lightHaptic()
        onChange(String(Math.max(1, (parseInt(value, 10) || 1) + 1)))
    }
    const handleDecrease = () => {
        lightHaptic()
        onChange(String(Math.max(1, (parseInt(value, 10) || 1) - 1)))
    }
    return (
        <View style={styles.quantityRow}>
            <Text style={styles.categoryLabel}>{UI_TEXT.QUANTITY}</Text>
            <RNText
                style={styles.quantityStepperButton}
                onPress={handleIncrease}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={A11Y_LABELS.INCREASE_QUANTITY}
            >
                +
            </RNText>
            <RNText style={styles.quantityValue}>{value}</RNText>
            <RNText
                style={styles.quantityStepperButton}
                onPress={handleDecrease}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={A11Y_LABELS.DECREASE_QUANTITY}
            >
                −
            </RNText>
        </View>
    )
}
