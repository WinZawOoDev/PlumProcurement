import React, { useCallback } from 'react'
import { View, Text as RNText, Pressable } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'
import FontAwesomeIcon from '@react-native-vector-icons/fontawesome-free-solid'
import { useTheme } from '@rneui/themed'
import { useTranslation } from 'react-i18next'
import { useStyles } from '../../styles'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { DIMENSIONS } from '../../constants'
import { formatNumber } from '../../utils'
import { MoneyText } from '../../components/MoneyText'
import { ISellerWithStats } from '../../types/database'

interface SellerRowProps {
    seller: ISellerWithStats
    /** Stable callbacks receiving the seller: keeps React.memo effective. */
    onEdit: (seller: ISellerWithStats) => void
    onPress?: (seller: ISellerWithStats) => void
    purchaseCount?: number
    purchaseTotal?: number
    balance?: number
}

function SellerRowInner({ seller, onEdit, onPress, purchaseCount, purchaseTotal, balance }: SellerRowProps) {
    const styles = useStyles()
    const { theme } = useTheme()
    const { t } = useTranslation()
    const { A11Y_LABELS, CURRENCY } = useLocalizedConstants()
    const initial = seller.name.trim().charAt(0).toUpperCase() || '?'
    const handlePress = useCallback(() => onPress?.(seller), [onPress, seller])
    const handleEdit = useCallback(() => onEdit(seller), [onEdit, seller])
    return (
        <Pressable
            onPress={handlePress}
            testID={`seller-row-${seller.id}`}
            style={styles.purchaseItemRow}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('a11y.SELLER_SUMMARY', {
                purchaseCount: formatNumber(purchaseCount ?? 0, 0),
                purchaseTotal: `${formatNumber(purchaseTotal ?? 0)}${CURRENCY}`,
                balance: `${formatNumber(balance ?? 0)}${CURRENCY}`,
            })}
        >
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
                    // Not separately accessible: the row itself carries the
                    // summarized SELLER_SUMMARY label (avoids double announcement).
                    <View style={styles.sellerRowDotLegend}>
                        {(purchaseCount ?? 0) > 0 && (
                            <>
                                <Ionicons name="receipt-outline" size={12} color={theme.colors.primary} />
                                <RNText style={styles.sellerRowDotText}>
                                    {formatNumber(purchaseCount ?? 0, 0)} · <MoneyText amount={purchaseTotal ?? 0} />
                                </RNText>
                            </>
                        )}
                        {(balance ?? 0) > 0 && (
                            <>
                                <Ionicons name="wallet-outline" size={12} color={theme.colors.warning} />
                                <MoneyText amount={balance ?? 0} valueStyle={styles.sellerRowDotText} />
                            </>
                        )}
                    </View>
                )}
            </View>
            <Pressable
                // Nested pressables do not propagate to the outer row in React
                // Native (the innermost responder wins), so no stopPropagation
                // dance is needed — just handle the edit.
                onPress={handleEdit}
                testID={`edit-seller-${seller.id}`}
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
