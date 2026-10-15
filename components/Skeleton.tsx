import React, { useEffect, useRef } from 'react'
import { View, Animated, DimensionValue, StyleProp, ViewStyle } from 'react-native'
import { useTheme } from '@rneui/themed'
import { useStyles } from '../styles'
import { useLocalizedConstants } from '../hooks/useLocalizedConstants'

interface SkeletonProps {
    width?: DimensionValue
    height?: number
    radius?: number
    style?: StyleProp<ViewStyle>
}

/**
 * Decorative placeholder bar. Hidden from assistive tech: the enclosing
 * skeleton group announces a single loading label instead.
 */
export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
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
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
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
    const { MESSAGES } = useLocalizedConstants()
    return (
        <View
            style={styles.cardSkeletonContainer}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={MESSAGES.LOADING}
        >
            <Skeleton width="40%" height={14} />
            <Skeleton width="70%" height={12} />
            <View style={styles.cardSkeletonRow}>
                <Skeleton width={60} height={24} radius={12} />
                <Skeleton width={60} height={24} radius={12} />
            </View>
        </View>
    )
}
