import React from 'react'
import { View, Text as RNText, Pressable } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'
import FontAwesomeIcon from '@react-native-vector-icons/fontawesome-free-solid'
import { useTheme } from '@rneui/themed'
import { useStyles } from '../../styles'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { DIMENSIONS } from '../../constants'
import { formatNumber } from '../../utils'
import { ISeller } from '../../types/database'

interface SellerRowProps {
    seller: ISeller
    onEdit: () => void
    onPress?: () => void
    purchaseCount?: number
    purchaseTotal?: number
    balance?: number
}

function SellerRowInner({ seller, onEdit, onPress, purchaseCount, purchaseTotal, balance }: SellerRowProps) {
    const styles = useStyles()
    const { theme } = useTheme()
    const { UI_TEXT, A11Y_LABELS, CURRENCY } = useLocalizedConstants()
    const initial = seller.name.trim().charAt(0).toUpperCase() || '?'
    return (
        <Pressable onPress={onPress} style={styles.purchaseItemRow}>
            <View style={styles.avatarCircle}>
                <RNText style={styles.avatarText}>{initial}</RNText>
            </View>
            <View style={styles.sellerInfo}>
                <RNText style={styles.sellerNameText}>{seller.name}</RNText>
                {!!seller.phone && (
                    <View style={styles.sellerRowContactRow}>
                        <Ionicons name="call-outline" size={12} color={theme.colors.tertiary} />
                        <RNText style={styles.sellerRowContactText}>{seller.phone}</RNText>
                    </View>
                )}
                {!!seller.address && (
                    <View style={styles.sellerRowContactRow}>
                        <Ionicons name="location-outline" size={12} color={theme.colors.tertiary} />
                        <RNText style={styles.sellerRowContactText}>{seller.address}</RNText>
                    </View>
                )}
                {((purchaseCount ?? 0) > 0 || (balance ?? 0) > 0) && (
                    <View
                        style={styles.sellerRowDotLegend}
                        accessible
                        accessibilityLabel={`${purchaseCount ?? 0} ${UI_TEXT.PURCHASES_COUNT.toLowerCase()}, ${formatNumber(purchaseTotal ?? 0)}${CURRENCY} ${UI_TEXT.TOTAL_VALUE.toLowerCase()}, ${formatNumber(balance ?? 0)}${CURRENCY} ${UI_TEXT.BALANCE.toLowerCase()}`}
                    >
                        {(purchaseCount ?? 0) > 0 && (
                            <>
                                <Ionicons name="receipt-outline" size={12} color={theme.colors.primary} />
                                <RNText style={styles.sellerRowDotText}>
                                    {purchaseCount} · {formatNumber(purchaseTotal ?? 0)}{CURRENCY}
                                </RNText>
                            </>
                        )}
                        {(balance ?? 0) > 0 && (
                            <>
                                <Ionicons name="wallet-outline" size={12} color={theme.colors.warning} />
                                <RNText style={styles.sellerRowDotText}>
                                    {formatNumber(balance ?? 0)}{CURRENCY}
                                </RNText>
                            </>
                        )}
                    </View>
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
                style={styles.sellerRowEditButton}
            >
                <FontAwesomeIcon name="edit" size={DIMENSIONS.ICON_SIZE_SMALL} color={theme.colors.primary} />
            </Pressable>
        </Pressable>
    )
}
export const SellerRow = React.memo(SellerRowInner)
