import React from 'react'
import { Text as RNText, View } from 'react-native'
import { Text } from '@rneui/themed'
import { useStyles } from '../styles'
import { IPrice } from '../types/database'
import { formatDate } from '../utils'
import { DetailSheet } from './DetailSheet'

export function PriceDetailSheet({ visible, price, onClose }: { visible: boolean; price: IPrice | null; onClose: () => void }) {
    const styles = useStyles()
    if (!price) return null
    return (
        <DetailSheet visible={visible} onClose={onClose}>
            <Text style={styles.bottomSheetTitle}>Price Detail</Text>
            <View style={styles.detailSheetBody}>
                <RNText style={styles.purchaseItemTitle}>#{price.category} — {price.price.toFixed(2)}$ / {price.unit}</RNText>
                <RNText style={styles.purchaseItemSubtitle}>{price.is_available ? 'Available' : 'Unavailable'} · {formatDate(price.created_at)}</RNText>
            </View>
        </DetailSheet>
    )
}
