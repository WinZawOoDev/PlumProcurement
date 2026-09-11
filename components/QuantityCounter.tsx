import React from 'react'
import { View, Text as RNText, TouchableOpacity } from 'react-native'
import { useStyles } from '../styles'
import { useLocalizedConstants } from '../hooks/useLocalizedConstants'
import { lightHaptic } from '../utils/haptics'
import { formatNumber } from '../utils'

interface QuantityCounterProps {
    value: number
    onIncrease: () => void
    onDecrease: () => void
    /** Contextual suffix for the accessibility labels (e.g. the category). */
    label?: string
    /** Quantity at or below which the decrease button is disabled. Defaults to 0. */
    min?: number
    /** Forces the active styling; defaults to `value > min`. */
    active?: boolean
}

/**
 * Round −/value/+ stepper shared by the purchase record price cards and the
 * purchase history edit sheet.
 */
export function QuantityCounter({
    value,
    onIncrease,
    onDecrease,
    label,
    min = 0,
    active,
}: QuantityCounterProps) {
    const styles = useStyles()
    const { A11Y_LABELS } = useLocalizedConstants()
    const isActive = active ?? value > min
    const canDecrease = value > min
    const suffix = label ? ` ${label}` : ''

    return (
        <View style={[styles.priceItemCardCounter, isActive && styles.priceItemCardCounterActive]}>
            <TouchableOpacity
                style={[styles.priceItemCardStepperButton, !canDecrease && styles.priceItemCardStepperButtonDisabled]}
                onPress={() => {
                    lightHaptic()
                    onDecrease()
                }}
                disabled={!canDecrease}
                activeOpacity={0.6}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${A11Y_LABELS.DECREASE_QUANTITY}${suffix}`}
                accessibilityState={{ disabled: !canDecrease }}
            >
                <RNText style={styles.priceItemCardStepperButtonText}>−</RNText>
            </TouchableOpacity>
            <View style={styles.priceItemCardValueBubble}>
                <RNText style={[styles.priceItemCardValue, isActive && styles.priceItemCardValueActive]}>
                    {formatNumber(value, 0)}
                </RNText>
            </View>
            <TouchableOpacity
                style={[styles.priceItemCardStepperButton, styles.priceItemCardStepperButtonPlus]}
                onPress={() => {
                    lightHaptic()
                    onIncrease()
                }}
                activeOpacity={0.6}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${A11Y_LABELS.INCREASE_QUANTITY}${suffix}`}
            >
                <RNText style={styles.priceItemCardStepperButtonTextPlus}>+</RNText>
            </TouchableOpacity>
        </View>
    )
}

export default QuantityCounter
