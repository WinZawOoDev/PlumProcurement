import React from 'react'
import { View, Text as RNText, Pressable } from 'react-native'
import { useStyles } from '../../styles'
import { A11Y_LABELS, UI_TEXT } from '../../constants'
import { ISeller } from '../../types/database'

interface SellerRowProps {
    seller: ISeller
    onEdit: () => void
    onPress?: () => void
    purchaseCount?: number
    purchaseTotal?: number
}

function SellerRowInner({ seller, onEdit, onPress, purchaseCount, purchaseTotal }: SellerRowProps) {
    const styles = useStyles()
    const initial = seller.name.trim().charAt(0).toUpperCase() || '?'
    return (
        <Pressable onPress={onPress} style={styles.purchaseItemRow}>
            <View style={styles.avatarCircle}>
                <RNText style={styles.avatarText}>{initial}</RNText>
            </View>
            <View style={styles.sellerInfo}>
                <RNText style={styles.sellerNameText}>{seller.name}</RNText>
                {!!seller.phone && <RNText style={styles.sellerPhoneText}>{seller.phone}</RNText>}
                {!!seller.address && <RNText style={styles.sellerPhoneText}>{seller.address}</RNText>}
                {(purchaseCount ?? 0) > 0 && (
                    <RNText style={[styles.sellerPhoneText, styles.sellerPurchaseStats]}>
                        {purchaseCount} purchases · {(purchaseTotal ?? 0).toFixed(2)}$
                    </RNText>
                )}
            </View>
            <Pressable
                onPress={(e: any) => {
                    e?.stopPropagation?.()
                    onEdit()
                }}
                accessibilityRole="button"
                accessibilityLabel={A11Y_LABELS.EDIT_SELLER}
                hitSlop={8}
            >
                <RNText style={styles.sellerEditLabel}>{UI_TEXT.EDIT}</RNText>
            </Pressable>
        </Pressable>
    )
}
export const SellerRow = React.memo(SellerRowInner)
