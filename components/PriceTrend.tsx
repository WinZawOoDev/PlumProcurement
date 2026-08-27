/* eslint-disable react-native/no-inline-styles */
import React, { useMemo } from 'react'
import { View, Text as RNText } from 'react-native'
import { Text } from '@rneui/themed'
import { useTheme } from '@rneui/themed'
import { IPrice } from '../types/database'

interface PriceTrendProps {
    prices: IPrice[]
}

export function PriceTrend({ prices }: PriceTrendProps) {
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
        <View style={{ marginBottom: 12, padding: 10, backgroundColor: theme.colors.secondary, borderRadius: 8 }}>
            <Text style={{ fontWeight: '600', marginBottom: 6, color: theme.colors.primary }}>
                Price Trend ({stats.count} items) — Avg {stats.avg.toFixed(2)}$
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 40 }}>
                {stats.sorted.slice(-12).map((p) => {
                    const h = ((p.price - stats.min) / range) * 36 + 4
                    return (
                        <View
                            key={p.id}
                            style={{
                                flex: 1,
                                height: h,
                                backgroundColor: theme.colors.primary,
                                borderRadius: 2,
                                opacity: p.is_available ? 1 : 0.4,
                            }}
                            accessible
                            accessibilityLabel={`${p.category} ${p.price} dollars`}
                        />
                    )
                })}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <RNText style={{ fontSize: 11, color: theme.colors.tertiary }}>{stats.min.toFixed(2)}$</RNText>
                <RNText style={{ fontSize: 11, color: theme.colors.tertiary }}>{stats.max.toFixed(2)}$</RNText>
            </View>
        </View>
    )
}
