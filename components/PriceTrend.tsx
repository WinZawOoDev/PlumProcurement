import React, { useMemo } from 'react'
import { View, Text as RNText, Pressable } from 'react-native'
import { Text } from '@rneui/themed'
import { useTheme } from '@rneui/themed'
import { useTranslation } from 'react-i18next'
import { useStyles } from '../styles'
import { IPrice } from '../types/database'

interface PriceTrendProps {
    prices: IPrice[]
    onSelect?: (price: IPrice) => void
}

export function PriceTrend({ prices, onSelect }: PriceTrendProps) {
    const styles = useStyles()
    const { theme } = useTheme()
    const { t } = useTranslation()

    const stats = useMemo(() => {
        if (prices.length === 0) return null
        const values = prices.map((p) => p.price)
        const min = Math.min(...values)
        const max = Math.max(...values)
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        const sorted = [...prices].sort((a, b) => new Date(a.created_at ?? '').getTime() - new Date(b.created_at ?? '').getTime())
        return { min, max, avg, sorted, count: prices.length }
    }, [prices])

    if (!stats) return null

    const range = stats.max - stats.min || 1

    return (
        <View style={styles.priceTrendContainer}>
            <Text style={styles.priceTrendTitle}>
                {t('uiText.PRICE_TREND_SUMMARY', { count: stats.count, avg: stats.avg.toFixed(2) })}
            </Text>
            <View style={styles.priceTrendBarsRow}>
                {stats.sorted.slice(-12).map((p) => {
                    const h = ((p.price - stats.min) / range) * 36 + 4
                    return (
                        <Pressable
                            key={p.id}
                            onPress={() => onSelect?.(p)}
                            style={[
                                styles.priceTrendBar,
                                { height: h, backgroundColor: theme.colors.primary },
                            ]}
                            accessible
                            accessibilityLabel={t('a11y.PRICE_TREND_BAR', { category: p.category, price: p.price })}
                            accessibilityRole="button"
                        />
                    )
                })}
            </View>
            <View style={styles.priceTrendScaleRow}>
                <RNText style={styles.priceTrendScaleText}>{stats.min.toFixed(2)}$</RNText>
                <RNText style={styles.priceTrendScaleText}>{stats.max.toFixed(2)}$</RNText>
            </View>
        </View>
    )
}
