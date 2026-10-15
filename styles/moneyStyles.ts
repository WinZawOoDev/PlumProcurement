import { StyleSheet, TextStyle } from 'react-native'

const CURRENCY_SCALE = 0.65
const MIN_CURRENCY_FONT_SIZE = 10
const DEFAULT_CURRENCY_FONT_SIZE = 12

const moneyStyles = StyleSheet.create({
    currency: {
        fontWeight: '400',
        opacity: 0.65,
    },
})

/**
 * Default style for the currency suffix of MoneyText: smaller than the value,
 * regular weight and de-emphasized. The size tracks the value's font size.
 */
export const moneyCurrencyStyle = (valueFontSize?: number): TextStyle => ({
    ...moneyStyles.currency,
    fontSize:
        typeof valueFontSize === 'number'
            ? Math.max(MIN_CURRENCY_FONT_SIZE, Math.round(valueFontSize * CURRENCY_SCALE))
            : DEFAULT_CURRENCY_FONT_SIZE,
})
