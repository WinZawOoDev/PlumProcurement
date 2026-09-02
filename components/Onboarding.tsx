import React, { useRef, useState } from 'react'
import { View, Text as RNText, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Pressable } from 'react-native'
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
    const scrollRef = useRef<ScrollView>(null)
    const [idx, setIdx] = useState(0)
    const [pageWidth, setPageWidth] = useState(0)
    const last = idx === SLIDES.length - 1

    const dotActiveStyle = { width: 20, backgroundColor: theme.colors.primary } as const
    const dotInactiveStyle = { width: 6, backgroundColor: theme.colors.grey2 } as const

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!pageWidth) return
        const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth)
        setIdx(Math.min(SLIDES.length - 1, Math.max(0, next)))
    }

    const goTo = (index: number) => {
        scrollRef.current?.scrollTo({ x: index * pageWidth, animated: true })
    }

    const handleNext = () => {
        if (last) onDone()
        else goTo(idx + 1)
    }

    return (
        <View style={styles.onboardingContainer}>
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.onboardingSlides}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
            >
                {SLIDES.map((s) => (
                    <View key={s.title} style={[styles.onboardingSlide, { width: pageWidth || '100%' }]}>
                        <View style={styles.onboardingIconCircle}>
                            <Ionicons name={s.icon as any} size={36} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.onboardingTitle}>{s.title}</Text>
                        <RNText style={styles.onboardingDescription}>{s.desc}</RNText>
                    </View>
                ))}
            </ScrollView>
            <View style={styles.onboardingDotsRow}>
                {SLIDES.map((_, i) => (
                    <Pressable
                        key={i}
                        onPress={() => goTo(i)}
                        accessibilityRole="button"
                        accessibilityLabel={`Go to slide ${i + 1}`}
                    >
                        <View style={[styles.onboardingDot, i === idx ? dotActiveStyle : dotInactiveStyle]} />
                    </Pressable>
                ))}
            </View>
            <View style={styles.onboardingButtons}>
                <PrimaryButton title={last ? 'Get Started' : 'Next'} onPress={handleNext} />
                {!last && <SecondaryButton title="Skip" onPress={onDone} />}
            </View>
        </View>
    )
}
