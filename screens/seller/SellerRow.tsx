import React from 'react'
import { View, Text as RNText, Pressable } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { A11Y_LABELS } from '../../constants'
import { ISeller } from '../../types/database'

interface SellerRowProps {
    seller: ISeller
    onDelete: () => void
    onPress?: () => void
    purchaseCount?: number
    purchaseTotal?: number
}

function SellerRowInner({ seller, onDelete, onPress, purchaseCount, purchaseTotal }: SellerRowProps) {
    const styles = useStyles()
    const { theme } = useTheme()
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
                    onDelete()
                }}
                accessibilityRole="button"
                accessibilityLabel={A11Y_LABELS.DELETE_SELLER}
                hitSlop={8}
                style={({ pressed }) => [
                    styles.sellerDeleteButton,
                    pressed && styles.sellerDeleteButtonPressed,
                ]}
            >
                <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
            </Pressable>
        </Pressable>
    )
}
export const SellerRow = React.memo(SellerRowInner)
