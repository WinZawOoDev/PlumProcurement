import React, { useState } from 'react'
import { View, Text as RNText } from 'react-native'
import { Text } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { PrimaryButton, SecondaryButton } from './buttons/Button'
import { useTheme } from '@rneui/themed'
import { useStyles } from '../styles'

const SLIDES = [
    { icon: 'pricetags-outline', title: 'Manage Prices', desc: 'Define market rates per category and unit in seconds.' },
    { icon: 'cart-outline', title: 'Record Purchases', desc: 'Pick a price, choose a seller, set quantity — total auto-calculates.' },
    { icon: 'people-outline', title: 'Track Sellers', desc: 'Keep your seller directory with purchase stats at a glance.' },
]

export function Onboarding({ onDone }: { onDone: () => void }) {
    const styles = useStyles()
    const { theme } = useTheme()
    const [idx, setIdx] = useState(0)
    const slide = SLIDES[idx]
    const last = idx === SLIDES.length - 1

    const dotActiveStyle = { width: 20, backgroundColor: theme.colors.primary } as const
    const dotInactiveStyle = { width: 6, backgroundColor: theme.colors.grey2 } as const

    return (
        <View style={styles.onboardingContainer}>
            <View style={styles.onboardingCenter}>
                <View style={styles.onboardingIconCircle}>
                    <Ionicons name={slide.icon as any} size={36} color={theme.colors.primary} />
                </View>
                <Text style={styles.onboardingTitle}>{slide.title}</Text>
                <RNText style={styles.onboardingDescription}>{slide.desc}</RNText>
            </View>
            <View style={styles.onboardingDotsRow}>
                {SLIDES.map((_, i) => (
                    <View key={i} style={[styles.onboardingDot, i === idx ? dotActiveStyle : dotInactiveStyle]} />
                ))}
            </View>
            <View style={styles.onboardingButtons}>
                <PrimaryButton title={last ? 'Get Started' : 'Next'} onPress={() => (last ? onDone() : setIdx(idx + 1))} />
                {!last && <SecondaryButton title="Skip" onPress={onDone} />}
            </View>
        </View>
    )
}
