import React from 'react'
import { View } from 'react-native'
import { useTheme } from '@rneui/themed'

export function Skeleton({ width = '100%', height = 16, radius = 8, style }: { width?: any; height?: number; radius?: number; style?: any }) {
    const { theme } = useTheme()
    return (
        <View
            style={[
                {
                    width,
                    height,
                    borderRadius: radius,
                    backgroundColor: theme.colors.grey1,
                    opacity: 0.7,
                },
                style,
            ]}
        />
    )
}

export function CardSkeleton() {
    const { theme } = useTheme()
    return (
        <View style={{ padding: 16, backgroundColor: theme.colors.surface ?? theme.colors.white, borderRadius: 16, marginBottom: 12, gap: 10 }}>
            <Skeleton width="40%" height={14} />
            <Skeleton width="70%" height={12} />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <Skeleton width={60} height={24} radius={12} />
                <Skeleton width={60} height={24} radius={12} />
            </View>
        </View>
    )
}
