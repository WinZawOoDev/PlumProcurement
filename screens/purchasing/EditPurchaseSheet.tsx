import React, { useEffect, useState } from 'react'
import { View, Text as RNText } from 'react-native'
import { BottomSheet, Text } from '@rneui/themed'
import { useTranslation } from 'react-i18next'
import { useStyles } from '../../styles'
import { QUANTITY_PATTERN } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { IPurchaseDetail } from '../../types/database'
import { purchaseService } from '../../services/purchaseService'
import { QuantityStepper } from '../../components/QuantityStepper'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { showSuccess, showError } from '../../utils/notifications'
import { formatNumber } from '../../utils'
import { useLoading } from '../../hooks/useAsync'

interface EditPurchaseSheetProps {
    visible: boolean
    purchase: IPurchaseDetail | null
    onClose: () => void
    onSaved: () => void
}

function EditPurchaseSummary({ total }: { total: number }) {
    const styles = useStyles()
    const { UI_TEXT, CURRENCY } = useLocalizedConstants()
    return (
        <View style={styles.purchaseSummaryCard}>
            <View style={styles.purchaseSummaryRow}>
                <RNText style={styles.purchaseSummaryLabel}>{UI_TEXT.TOTAL}</RNText>
                <RNText style={styles.purchaseTotalText}>{total > 0 ? `${formatNumber(total)}${CURRENCY}` : '—'}</RNText>
            </View>
        </View>
    )
}

function EditPurchaseActions({
    saving,
    onSave,
    onCancel,
}: {
    saving: boolean
    onSave: () => void
    onCancel: () => void
}) {
    const styles = useStyles()
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <View style={styles.formActions}>
            <PrimaryButton title={UI_TEXT.SAVE} disabled={saving} loading={saving} onPress={onSave} />
            <SecondaryButton title={UI_TEXT.CANCEL} onPress={onCancel} />
        </View>
    )
}

export function EditPurchaseSheet({ visible, purchase, onClose, onSaved }: EditPurchaseSheetProps) {
    const styles = useStyles()
    const { t } = useTranslation()
    const { UI_TEXT, MESSAGES, UNITS, CURRENCY } = useLocalizedConstants()
    const [quantities, setQuantities] = useState<Record<number, string>>({})
    const { loading: saving, withLoading: withSaving } = useLoading(false)

    useEffect(() => {
        if (visible && purchase) {
            const map: Record<number, string> = {}
            for (const item of purchase.items) {
                map[item.id] = String(item.quantity)
            }
            setQuantities(map)
        }
    }, [visible, purchase])

    const resolved = purchase
        ? purchase.items.map((item) => {
              const q = quantities[item.id] ?? String(item.quantity)
              const qty = parseInt(q, 10)
              return { item, q, qty, valid: QUANTITY_PATTERN.test(q) && qty > 0 }
          })
        : []

    const total = resolved.reduce((sum, r) => (r.valid ? sum + r.item.unit_price * r.qty : sum), 0)

    const handleSave = async () => {
        if (!purchase) return
        if (resolved.some((r) => !r.valid)) {
            showError(MESSAGES.ERROR_INVALID_QUANTITY)
            return
        }
        await withSaving(async () => {
            try {
                await purchaseService.editPurchase(purchase.id, {
                    items: resolved.map(({ item, qty }) => ({
                        price_id: item.price_id,
                        category: item.category,
                        unit: item.unit,
                        unit_price: item.unit_price,
                        quantity: qty,
                    })),
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
                {!!purchase?.seller_name && (
                    <RNText style={styles.purchaseItemSubtitle}>
                        {UI_TEXT.SOLD_BY}: {purchase.seller_name}
                    </RNText>
                )}
                {resolved.map(({ item, q }) => (
                    <View key={item.id} style={styles.editItemBlock}>
                        <RNText style={styles.purchaseItemSubtitle}>
                            {t(`categories.${item.category}`, { defaultValue: item.category })} ({UNITS[item.unit] ?? item.unit}) @ {formatNumber(item.unit_price)}{CURRENCY}
                        </RNText>
                        <QuantityStepper
                            value={q}
                            onChange={(next) => setQuantities((prev) => ({ ...prev, [item.id]: next }))}
                        />
                    </View>
                ))}
                <EditPurchaseSummary total={total} />
                <EditPurchaseActions saving={saving} onSave={handleSave} onCancel={onClose} />
            </View>
        </BottomSheet>
    )
}

export default EditPurchaseSheet
