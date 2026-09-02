import React, { useEffect, useState } from 'react'
import { View, Text as RNText } from 'react-native'
import { BottomSheet, Text } from '@rneui/themed'
import { useStyles } from '../../styles'
import { MESSAGES, UI_TEXT } from '../../constants'
import { IPurchaseWithSeller } from '../../types/database'
import { purchaseService } from '../../services/purchaseService'
import { QuantityStepper } from '../../components/QuantityStepper'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { showSuccess, showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'

interface EditPurchaseSheetProps {
    visible: boolean
    purchase: IPurchaseWithSeller | null
    onClose: () => void
    onSaved: () => void
}

export function EditPurchaseSheet({ visible, purchase, onClose, onSaved }: EditPurchaseSheetProps) {
    const styles = useStyles()
    const [quantity, setQuantity] = useState('1')
    const { loading: saving, withLoading: withSaving } = useLoading(false)

    useEffect(() => {
        if (visible && purchase) {
            setQuantity(String(purchase.quantity))
        }
    }, [visible, purchase])

    const quantityValue = parseInt(quantity, 10)
    const newTotal =
        purchase && Number.isInteger(quantityValue) && quantityValue > 0
            ? purchase.unit_price * quantityValue
            : 0

    const handleSave = async () => {
        if (!purchase) return
        if (!Number.isInteger(quantityValue) || quantityValue <= 0) {
            showError(MESSAGES.ERROR_INVALID_QUANTITY)
            return
        }
        await withSaving(async () => {
            try {
                await purchaseService.editPurchase(purchase.id, {
                    quantity: quantityValue,
                })
                showSuccess(MESSAGES.PURCHASE_UPDATE_SUCCESS)
                onSaved()
                onClose()
            } catch (error) {
                showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC)
            }
        })
    }

    return (
        <BottomSheet isVisible={visible} onBackdropPress={onClose} modalProps={{ animationType: 'slide' }}>
            <View style={styles.bottomSheetContainer}>
                <Text style={styles.bottomSheetTitle}>{UI_TEXT.EDIT_PURCHASE}</Text>
                {!!purchase && (
                    <RNText style={styles.purchaseItemSubtitle}>
                        {purchase.category} ({purchase.unit}) · {purchase.unit_price.toFixed(2)}$ / {UI_TEXT.UNIT}
                    </RNText>
                )}
                {!!purchase?.seller_name && (
                    <RNText style={styles.purchaseItemSubtitle}>
                        {UI_TEXT.SOLD_BY}: {purchase.seller_name}
                    </RNText>
                )}
                <QuantityStepper value={quantity} onChange={setQuantity} />
                <View style={styles.purchaseSummaryCard}>
                    <View style={styles.purchaseSummaryRow}>
                        <RNText style={styles.purchaseSummaryLabel}>{UI_TEXT.TOTAL}</RNText>
                        <RNText style={styles.purchaseTotalText}>{newTotal > 0 ? `${newTotal.toFixed(2)}$` : '—'}</RNText>
                    </View>
                </View>
                <View style={styles.formActions}>
                    <PrimaryButton title={UI_TEXT.SAVE} disabled={saving} loading={saving} onPress={handleSave} />
                    <SecondaryButton title={UI_TEXT.CANCEL} onPress={onClose} />
                </View>
            </View>
        </BottomSheet>
    )
}

export default EditPurchaseSheet
