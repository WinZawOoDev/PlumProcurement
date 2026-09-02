import React, { useMemo } from 'react'
import { Text as RNText, View } from 'react-native'
import { Text } from '@rneui/themed'
import { useStyles } from '../styles'
import { ISeller, IPurchaseWithSeller } from '../types/database'
import { formatDate } from '../utils'
import { DetailSheet } from './DetailSheet'

export function SellerDetailSheet({ visible, seller, purchases, onClose }: { visible: boolean; seller: ISeller | null; purchases: IPurchaseWithSeller[]; onClose: () => void }) {
    const styles = useStyles()
    const filtered = useMemo(() => purchases.filter((p) => p.seller_id === seller?.id), [purchases, seller])
    const total = filtered.reduce((s, p) => s + p.total, 0)
    const recent = useMemo(() => filtered.slice(0, 20), [filtered])
    if (!seller) return null
    return (
        <DetailSheet visible={visible} onClose={onClose} containerStyle={styles.sellerDetailSheetContainer}>
            <Text style={styles.bottomSheetTitle}>{seller.name}</Text>
            {!!seller.phone && <RNText style={styles.purchaseItemSubtitle}>{seller.phone}</RNText>}
            {!!seller.address && <RNText style={styles.purchaseItemSubtitle}>{seller.address}</RNText>}
            <RNText style={styles.purchaseItemSubtitle}>{filtered.length} purchases · {total.toFixed(2)}$ total</RNText>
            {recent.length > 0 ? (
                recent.map((item) => (
                    <View key={item.id} style={styles.purchaseItemRow}>
                        <View style={styles.sellerInfo}>
                            <RNText style={styles.purchaseItemTitle}>{item.category} × {item.quantity}</RNText>
                            <RNText style={styles.purchaseItemSubtitle}>{formatDate(item.created_at)}</RNText>
                        </View>
                        <RNText style={styles.purchaseItemTotal}>{item.total.toFixed(2)}$</RNText>
                    </View>
                ))
            ) : (
                <RNText style={styles.emptyPriceListText}>No purchases for this seller</RNText>
            )}
        </DetailSheet>
    )
}
