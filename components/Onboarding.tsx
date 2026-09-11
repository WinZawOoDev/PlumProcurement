import React, { useRef, useState } from 'react'
import { View, Text as RNText, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Pressable } from 'react-native'
import { Text } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useTranslation } from 'react-i18next'
import { PrimaryButton, SecondaryButton } from './buttons/Button'
import { useTheme } from '@rneui/themed'
import { useStyles } from '../styles'

const SLIDES = [
    { icon: 'pricetags-outline', titleKey: 'onboarding.pricesTitle', descKey: 'onboarding.pricesDescription' },
    { icon: 'cart-outline', titleKey: 'onboarding.purchasesTitle', descKey: 'onboarding.purchasesDescription' },
    { icon: 'people-outline', titleKey: 'onboarding.sellersTitle', descKey: 'onboarding.sellersDescription' },
]

export function Onboarding({ onDone }: { onDone: () => void }) {
    const styles = useStyles()
    const { theme } = useTheme()
    const { t } = useTranslation()
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
                    <View key={s.titleKey} style={[styles.onboardingSlide, { width: pageWidth || '100%' }]}>
                        <View style={styles.onboardingIconCircle}>
                            <Ionicons name={s.icon as any} size={36} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.onboardingTitle}>{t(s.titleKey)}</Text>
                        <RNText style={styles.onboardingDescription}>{t(s.descKey)}</RNText>
                    </View>
                ))}
            </ScrollView>
            <View style={styles.onboardingDotsRow}>
                {SLIDES.map((_, i) => (
                    <Pressable
                        key={i}
                        onPress={() => goTo(i)}
                        accessibilityRole="button"
                        accessibilityLabel={t('onboarding.goToSlide', { index: i + 1 })}
                    >
                        <View style={[styles.onboardingDot, i === idx ? dotActiveStyle : dotInactiveStyle]} />
                    </Pressable>
                ))}
            </View>
            <View style={styles.onboardingButtons}>
                <PrimaryButton title={last ? t('onboarding.getStarted') : t('onboarding.next')} onPress={handleNext} />
                {!last && <SecondaryButton title={t('onboarding.skip')} onPress={onDone} />}
            </View>
        </View>
    )
}
