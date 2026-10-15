import React from 'react'
import { StyleProp, StyleSheet, Text as RNText, TextStyle } from 'react-native'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../utils'
import { moneyCurrencyStyle } from '../styles/moneyStyles'

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
    // Only the currency string is needed here; avoid the full constants hook.
    const { t } = useTranslation()
    const valueFontSize = StyleSheet.flatten(valueStyle)?.fontSize
    return (
        <RNText style={valueStyle} numberOfLines={numberOfLines}>
            {formatNumber(amount, fractionDigits)}
            <RNText style={[moneyCurrencyStyle(valueFontSize), currencyStyle]}>
                {' '}{currency ?? t('currency')}
            </RNText>
        </RNText>
    )
}
