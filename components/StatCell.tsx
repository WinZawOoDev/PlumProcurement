import React from 'react'
import { View, Text as RNText } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useTheme } from '@rneui/themed'
import { useStyles } from '../styles'

export function StatCell({ label, value, icon }: { label: string; value: string; icon: string }) {
    const styles = useStyles()
    const { theme } = useTheme()
    return (
        <View style={styles.sellerStatCell}>
            <View style={styles.sellerStatIconCircle}>
                <Ionicons name={icon as any} size={16} color={theme.colors.primary} />
            </View>
            <RNText style={styles.sellerStatValue}>{value}</RNText>
            <RNText style={styles.sellerStatLabel}>{label}</RNText>
        </View>
    )
}
