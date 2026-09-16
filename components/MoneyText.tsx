import React from 'react'
import { StyleProp, StyleSheet, Text as RNText, TextStyle } from 'react-native'
import { formatNumber } from '../utils'
import { useLocalizedConstants } from '../hooks/useLocalizedConstants'

interface MoneyTextProps {
    amount: number
    fractionDigits?: number
    valueStyle?: StyleProp<TextStyle>
    currencyStyle?: StyleProp<TextStyle>
    currency?: string
    numberOfLines?: number
}

/**
 * Renders a monetary amount with the currency symbol visually separated from
 * the numeric value. The value keeps the caller's emphasis while the currency
 * renders smaller, regular weight and de-emphasized with a leading space, so
 * the two can never be confused. The currency size defaults to ~65% of the
 * value size and can be overridden per call site via `currencyStyle`.
 */
export function MoneyText({
    amount,
    fractionDigits,
    valueStyle,
    currencyStyle,
    currency,
    numberOfLines,
}: MoneyTextProps) {
    const { CURRENCY } = useLocalizedConstants()
    const valueFontSize = StyleSheet.flatten(valueStyle)?.fontSize
    const fallbackCurrencyStyle: TextStyle = {
        fontSize:
            typeof valueFontSize === 'number'
                ? Math.max(10, Math.round(valueFontSize * 0.65))
                : 12,
        fontWeight: '400',
        opacity: 0.65,
    }
    return (
        <RNText style={valueStyle} numberOfLines={numberOfLines}>
            {formatNumber(amount, fractionDigits)}
            <RNText style={[fallbackCurrencyStyle, currencyStyle]}>
                {' '}{currency ?? CURRENCY}
            </RNText>
        </RNText>
    )
}
