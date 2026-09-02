import React from 'react'
import { View, Text as RNText, Pressable } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'
import FontAwesomeIcon from '@react-native-vector-icons/fontawesome-free-solid'
import { Button } from '@rneui/themed'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { DIMENSIONS, A11Y_LABELS } from '../../constants'
import { ISeller } from '../../types/database'

interface SellerRowProps {
    seller: ISeller
    onEdit: () => void
    onDelete: () => void
    onPress?: () => void
    purchaseCount?: number
    purchaseTotal?: number
}

function SellerRowInner({ seller, onEdit, onDelete, onPress, purchaseCount, purchaseTotal }: SellerRowProps) {
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
            <View style={styles.priceCardActionsRow}>
                <Button
                    buttonStyle={styles.rowIconButton}
                    icon={<FontAwesomeIcon name="edit" size={DIMENSIONS.ICON_SIZE_SMALL} color={theme.colors.primary} />}
                    onPress={onEdit}
                    accessibilityLabel={A11Y_LABELS.EDIT_SELLER}
                />
                <Button
                    buttonStyle={[styles.rowIconButton, styles.rowIconDeleteButton]}
                    icon={<Ionicons name="trash-outline" size={DIMENSIONS.ICON_SIZE_SMALL} color="white" />}
                    onPress={onDelete}
                    accessibilityLabel={A11Y_LABELS.DELETE_SELLER}
                />
            </View>
        </Pressable>
    )
}
export const SellerRow = React.memo(SellerRowInner)
