import React, { useMemo } from 'react'
import { View, Text as RNText } from 'react-native'
import { BottomSheet, Text } from '@rneui/themed'
import { useStyles } from '../styles'
import { ISeller, IPurchaseWithSeller } from '../types/database'
import { formatDate } from '../utils'

export function SellerDetailSheet({ visible, seller, purchases, onClose }: { visible: boolean; seller: ISeller | null; purchases: IPurchaseWithSeller[]; onClose: () => void }) {
    const styles = useStyles()
    const filtered = useMemo(() => purchases.filter((p) => p.seller_id === seller?.id), [purchases, seller])
    const total = filtered.reduce((s, p) => s + p.total, 0)
    const recent = useMemo(() => filtered.slice(0, 20), [filtered])
    if (!seller) return null
    return (
        <BottomSheet isVisible={visible} onBackdropPress={onClose} modalProps={{ animationType: 'slide' }}>
            <View style={[styles.bottomSheetContainer, styles.sellerDetailSheetContainer]}>
                <Text style={styles.bottomSheetTitle}>{seller.name}</Text>
                {!!seller.phone && <RNText style={styles.purchaseItemSubtitle}>{seller.phone}</RNText>}
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
            </View>
        </BottomSheet>
    )
}
