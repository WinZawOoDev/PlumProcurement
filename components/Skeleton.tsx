import React, { useEffect, useRef } from 'react'
import { View, Animated } from 'react-native'
import { useTheme } from '@rneui/themed'
import { useStyles } from '../styles'

export function Skeleton({ width = '100%', height = 16, radius = 8, style }: { width?: any; height?: number; radius?: number; style?: any }) {
    const { theme } = useTheme()
    const opacity = useRef(new Animated.Value(0.5)).current

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.5, duration: 800, useNativeDriver: true }),
            ])
        )
        loop.start()
        return () => loop.stop()
    }, [opacity])

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius: radius,
                    backgroundColor: theme.colors.grey1,
                    opacity,
                },
                style,
            ]}
        />
    )
}

export function CardSkeleton() {
    const styles = useStyles()
    return (
        <View style={styles.cardSkeletonContainer}>
            <Skeleton width="40%" height={14} />
            <Skeleton width="70%" height={12} />
            <View style={styles.cardSkeletonRow}>
                <Skeleton width={60} height={24} radius={12} />
                <Skeleton width={60} height={24} radius={12} />
            </View>
        </View>
    )
}
