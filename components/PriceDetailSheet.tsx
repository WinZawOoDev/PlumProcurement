import React from 'react'
import { View, Text as RNText } from 'react-native'
import { BottomSheet, Text } from '@rneui/themed'
import { useStyles } from '../styles'
import { IPrice } from '../types/database'
import { formatDate } from '../utils'

export function PriceDetailSheet({ visible, price, onClose }: { visible: boolean; price: IPrice | null; onClose: () => void }) {
    const styles = useStyles()
    if (!price) return null
    return (
        <BottomSheet isVisible={visible} onBackdropPress={onClose} modalProps={{ animationType: 'slide' }}>
            <View style={styles.bottomSheetContainer}>
                <Text style={styles.bottomSheetTitle}>Price Detail</Text>
                <View style={{ gap: 8, marginTop: 12 }}>
                    <RNText style={styles.purchaseItemTitle}>#{price.category} — {price.price.toFixed(2)}$ / {price.unit}</RNText>
                    <RNText style={styles.purchaseItemSubtitle}>{price.is_available ? 'Available' : 'Unavailable'} · {formatDate(price.created_at)}</RNText>
                </View>
            </View>
        </BottomSheet>
    )
}
