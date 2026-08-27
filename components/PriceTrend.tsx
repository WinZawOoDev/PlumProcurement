import React, { useMemo } from 'react'
import { View, Text as RNText } from 'react-native'
import { Text } from '@rneui/themed'
import { useTheme } from '@rneui/themed'
import { useStyles } from '../styles'
import { IPrice } from '../types/database'

interface PriceTrendProps {
    prices: IPrice[]
}

export function PriceTrend({ prices }: PriceTrendProps) {
    const styles = useStyles()
    const { theme } = useTheme()

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
                Price Trend ({stats.count} items) — Avg {stats.avg.toFixed(2)}$
            </Text>
            <View style={styles.priceTrendBarsRow}>
                {stats.sorted.slice(-12).map((p) => {
                    const h = ((p.price - stats.min) / range) * 36 + 4
                    return (
                        <View
                            key={p.id}
                            // eslint-disable-next-line react-native/no-inline-styles
                            style={[
                                styles.priceTrendBar,
                                { height: h, backgroundColor: theme.colors.primary, opacity: p.is_available ? 1 : 0.4 },
                            ]}
                            accessible
                            accessibilityLabel={`${p.category} ${p.price} dollars`}
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
