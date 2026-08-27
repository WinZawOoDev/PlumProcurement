import React, { useState } from 'react'
import { View, Text as RNText } from 'react-native'
import { Text } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { PrimaryButton, SecondaryButton } from './buttons/Button'
import { useTheme } from '@rneui/themed'

const SLIDES = [
    { icon: 'pricetags-outline', title: 'Manage Prices', desc: 'Define market rates per category and unit in seconds.' },
    { icon: 'cart-outline', title: 'Record Purchases', desc: 'Pick a price, choose a seller, set quantity — total auto-calculates.' },
    { icon: 'people-outline', title: 'Track Sellers', desc: 'Keep your seller directory with purchase stats at a glance.' },
]

export function Onboarding({ onDone }: { onDone: () => void }) {
    const { theme } = useTheme()
    const [idx, setIdx] = useState(0)
    const slide = SLIDES[idx]
    const last = idx === SLIDES.length - 1

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', padding: 24, gap: 24 }}>
            <View style={{ alignItems: 'center', gap: 12 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary + '12', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={slide.icon as any} size={36} color={theme.colors.primary} />
                </View>
                <Text style={{ fontSize: 22, fontWeight: '700', color: theme.colors.primary }}>{slide.title}</Text>
                <RNText style={{ fontSize: 14, color: theme.colors.grey4, textAlign: 'center', lineHeight: 20 }}>{slide.desc}</RNText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                {SLIDES.map((_, i) => (
                    <View key={i} style={{ width: i === idx ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === idx ? theme.colors.primary : theme.colors.grey2 }} />
                ))}
            </View>
            <View style={{ gap: 10 }}>
                <PrimaryButton title={last ? 'Get Started' : 'Next'} onPress={() => (last ? onDone() : setIdx(idx + 1))} />
                {!last && <SecondaryButton title="Skip" onPress={onDone} />}
            </View>
        </View>
    )
}
