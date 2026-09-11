import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, ScrollView, Text as RNText, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { useStyles } from '../../styles'
import { ROUTES, SAFE_AREA } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { IPurchaseDetail } from '../../types/database'
import { purchaseService } from '../../services/purchaseService'
import { QuantityCounter } from '../../components/QuantityCounter'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { showSuccess, showError, showUndo } from '../../utils/notifications'
import { formatDateDisplay, formatNumber } from '../../utils'
import { useLoading } from '../../hooks/useAsync'

type EditPurchaseRouteProp = RouteProp<Record<string, { purchase: IPurchaseDetail }>, typeof ROUTES.EDIT_PURCHASE>

function EditItemCard({
    category,
    unit,
    unitPrice,
    quantity,
    onIncrease,
    onDecrease,
}: {
    category: string
    unit: string
    unitPrice: number
    quantity: number
    onIncrease: () => void
    onDecrease: () => void
}) {
    const styles = useStyles()
    const { t } = useTranslation()
    const { UNITS, CURRENCY } = useLocalizedConstants()
    const categoryLabel = t(`categories.${category}`, { defaultValue: category })
    return (
        <View style={styles.priceItemCard}>
            <View style={styles.priceItemCardHeader}>
                <View style={styles.priceItemCardHeaderText}>
                    <RNText style={styles.priceItemCardTitle}>{categoryLabel}</RNText>
                    <RNText style={styles.priceItemCardUnit}>{UNITS[unit] ?? unit}</RNText>
                </View>
                <View style={styles.priceItemCardPriceBlock}>
                    <RNText style={styles.priceItemCardPrice}>{formatNumber(unitPrice)}</RNText>
                    <RNText style={styles.priceItemCardCurrency}>{CURRENCY}</RNText>
                </View>
            </View>
            <QuantityCounter
                value={quantity}
                min={1}
                active
                label={categoryLabel}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
            />
            <View style={styles.priceItemCardFooter}>
                <RNText style={styles.priceItemCardFooterCalc}>
                    {formatNumber(quantity, 0)} × {formatNumber(unitPrice)}{CURRENCY}
                </RNText>
                <RNText style={styles.priceItemCardFooterTotal}>{formatNumber(unitPrice * quantity)}{CURRENCY}</RNText>
            </View>
        </View>
    )
}

export default function EditPurchase() {
    const styles = useStyles()
    const { UI_TEXT, MESSAGES, CURRENCY } = useLocalizedConstants()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const route = useRoute<EditPurchaseRouteProp>()
    const purchase = route.params?.purchase
    const [quantities, setQuantities] = useState<Record<number, number>>({})
    const { loading: saving, withLoading: withSaving } = useLoading(false)
    const allowLeaveRef = useRef(false)
    // Synchronous mirror so quick repeated taps accumulate correctly and undo
    // can restore the exact previous value.
    const quantitiesRef = useRef<Record<number, number>>({})

    useEffect(() => {
        if (purchase) {
            const map: Record<number, number> = {}
            for (const item of purchase.items) {
                map[item.id] = item.quantity
            }
            quantitiesRef.current = map
            setQuantities(map)
        }
    }, [purchase])

    const resolved = useMemo(
        () =>
            purchase
                ? purchase.items.map((item) => {
                      const qty = quantities[item.id] ?? item.quantity
                      return { item, qty, valid: Number.isInteger(qty) && qty > 0 }
                  })
                : [],
        [purchase, quantities]
    )

    const total = resolved.reduce((sum, r) => (r.valid ? sum + r.item.unit_price * r.qty : sum), 0)
    const isDirty = resolved.some(({ item, qty }) => qty !== item.quantity)

    const adjust = (itemId: number, delta: number) => {
        const previous = quantitiesRef.current[itemId] ?? 1
        const next = Math.max(1, previous + delta)
        if (next === previous) return
        const updated = { ...quantitiesRef.current, [itemId]: next }
        quantitiesRef.current = updated
        setQuantities(updated)
        showUndo(UI_TEXT.QUANTITY_UPDATED, () => {
            const restored = { ...quantitiesRef.current, [itemId]: previous }
            quantitiesRef.current = restored
            setQuantities(restored)
        })
    }

    // Warn before discarding unsaved quantity edits (back gesture, hardware back,
    // header back). Saving sets allowLeaveRef so the successful goBack skips it.
    useEffect(() => {
        if (!isDirty) return
        const unsubscribe = navigation.addListener('beforeRemove', (event) => {
            if (allowLeaveRef.current) return
            event.preventDefault()
            Alert.alert(UI_TEXT.DISCARD_CHANGES_TITLE, UI_TEXT.DISCARD_CHANGES_MESSAGE, [
                { text: UI_TEXT.CANCEL, style: 'cancel' },
                {
                    text: UI_TEXT.DISCARD,
                    style: 'destructive',
                    onPress: () => navigation.dispatch(event.data.action),
                },
            ])
        })
        return unsubscribe
    }, [
        navigation,
        isDirty,
        UI_TEXT.DISCARD_CHANGES_TITLE,
        UI_TEXT.DISCARD_CHANGES_MESSAGE,
        UI_TEXT.CANCEL,
        UI_TEXT.DISCARD,
    ])

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
                allowLeaveRef.current = true
                navigation.goBack()
            } catch (error) {
                showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC)
            }
        })
    }

    if (!purchase) {
        return (
            <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.purchaseHistoryScreen}>
                <EmptyState
                    icon="receipt-outline"
                    title={UI_TEXT.EMPTY_PURCHASE_LIST}
                    description={UI_TEXT.PURCHASE_SUMMARY_DESCRIPTION}
                />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.purchaseHistoryScreen}>
            <View style={[styles.purchaseHistoryContainer, styles.fillContainer]}>
                <SectionHeader
                    onBack={() => navigation.goBack()}
                    title={UI_TEXT.EDIT_PURCHASE}
                    description={UI_TEXT.EDIT_PURCHASE_DESCRIPTION}
                />
                <View style={styles.purchaseSummaryCard}>
                    <View style={styles.purchaseSummaryHeroRow}>
                        <View style={styles.purchaseSummaryAvatar}>
                            <RNText style={styles.purchaseSummaryAvatarText}>
                                {(purchase.seller_name ?? UI_TEXT.NO_SELLER).charAt(0).toUpperCase()}
                            </RNText>
                        </View>
                        <View style={styles.purchaseSummaryHeroText}>
                            <RNText style={styles.purchaseSummarySellerName}>
                                {purchase.seller_name ?? UI_TEXT.NO_SELLER}
                            </RNText>
                            <RNText style={styles.purchaseSummaryDateText}>
                                {formatDateDisplay(purchase.created_at)}
                            </RNText>
                        </View>
                    </View>
                </View>
                <ScrollView
                    style={styles.editPurchaseList}
                    contentContainerStyle={styles.editPurchaseItemsContent}
                    showsVerticalScrollIndicator
                    persistentScrollbar
                >
                    {resolved.map(({ item, qty }) => (
                        <EditItemCard
                            key={item.id}
                            category={item.category}
                            unit={item.unit}
                            unitPrice={item.unit_price}
                            quantity={qty}
                            onIncrease={() => adjust(item.id, 1)}
                            onDecrease={() => adjust(item.id, -1)}
                        />
                    ))}
                </ScrollView>
                <View style={styles.editPurchaseFooter}>
                    <View style={styles.editPurchaseFooterTotal}>
                        <RNText style={styles.purchaseSummaryLabel}>{UI_TEXT.TOTAL}</RNText>
                        <RNText style={styles.purchaseTotalText}>
                            {total > 0 ? `${formatNumber(total)}${CURRENCY}` : '—'}
                        </RNText>
                    </View>
                    <PrimaryButton
                        title={UI_TEXT.SAVE}
                        disabled={saving || !isDirty}
                        loading={saving}
                        onPress={handleSave}
                    />
                    <SecondaryButton title={UI_TEXT.CANCEL} onPress={() => navigation.goBack()} />
                </View>
            </View>
        </SafeAreaView>
    )
}
