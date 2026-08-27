import { FlatList, Text as RNText, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Text } from '@rneui/base'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStyles } from '../../styles'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { UI_TEXT, MESSAGES, ROUTES, SAFE_AREA, QUANTITY_PATTERN } from '../../constants'
import { usePrices } from '../../context/PriceContext'
import { purchaseService } from '../../services/purchaseService'
import { sellerService } from '../../services/sellerService'
import { IPurchaseWithSeller } from '../../database'
import { SelectPicker } from '../../components/SelectPicker'
import { QuantityStepper } from '../../components/QuantityStepper'
import { showSuccess, showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'

export default function Purchase() {
    const styles = useStyles()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const { prices, refresh: refreshPrices } = usePrices()

    const [selectedPriceId, setSelectedPriceId] = useState<string>('')
    const [selectedSellerId, setSelectedSellerId] = useState<string>('')
    const [sellers, setSellers] = useState<{ id: number; name: string }[]>([])
    const [quantity, setQuantity] = useState('1')
    const [recent, setRecent] = useState<IPurchaseWithSeller[]>([])
    const { loading: recording, withLoading: withRecording } = useLoading(false)

    const loadRecent = useCallback(async () => {
        try {
            setRecent(await purchaseService.getPurchases())
        } catch (error) {
            showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC)
        }
    }, [])

    const loadSellers = useCallback(async () => {
        try {
            setSellers(await sellerService.getSellers())
        } catch (error) {
            showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC)
        }
    }, [])

    useEffect(() => {
        loadRecent()
        loadSellers()
        refreshPrices()
    }, [loadRecent, loadSellers, refreshPrices])

    const selectedPrice = prices.find((p) => p.id.toString() === selectedPriceId)
    const quantityValue = parseInt(quantity, 10)
    const total =
        selectedPrice && QUANTITY_PATTERN.test(quantity) && quantityValue > 0
            ? selectedPrice.price * quantityValue
            : 0

    const handleRecord = async () => {
        if (!selectedPrice) {
            showSuccess(UI_TEXT.SELECT_PRICE_ITEM)
            return
        }
        if (!QUANTITY_PATTERN.test(quantity) || quantityValue <= 0) {
            showError(MESSAGES.ERROR_INVALID_QUANTITY)
            return
        }
        await withRecording(async () => {
            try {
                await purchaseService.recordPurchase({
                    price_id: selectedPrice.id,
                    seller_id: selectedSellerId ? parseInt(selectedSellerId, 10) : null,
                    category: selectedPrice.category,
                    unit: selectedPrice.unit,
                    unit_price: selectedPrice.price,
                    quantity: quantityValue,
                    total,
                })
                showSuccess(MESSAGES.PURCHASE_RECORDED_SUCCESS)
                await loadRecent()
                setQuantity('1')
            } catch (error) {
                const message = error instanceof Error ? error.message : MESSAGES.ERROR_GENERIC
                showError(message)
            }
        })
    }

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={styles.priceListContainer}>
                <SectionHeader icon="cart-outline" title={UI_TEXT.RECORD_PURCHASE} description={UI_TEXT.PURCHASE_DESCRIPTION} />

                <View style={styles.formCard}>
                    <SelectPicker
                        label={UI_TEXT.SELECT_SELLER}
                        selectedValue={selectedSellerId}
                        onValueChange={setSelectedSellerId}
                        items={[
                            { label: UI_TEXT.NO_SELLER, value: '' },
                            ...sellers.map((s) => ({ label: s.name, value: s.id.toString() })),
                        ]}
                    />
                    <SelectPicker
                        label={UI_TEXT.SELECT_PRICE_ITEM}
                        selectedValue={selectedPriceId}
                        onValueChange={setSelectedPriceId}
                        items={[
                            { label: UI_TEXT.SELECT_PRICE_ITEM, value: '' },
                            ...prices.map((p) => ({
                                label: `${p.category} - ${p.price.toFixed(2)}$ / ${p.unit}`,
                                value: p.id.toString(),
                            })),
                        ]}
                    />
                    <QuantityStepper value={quantity} onChange={setQuantity} />
                    <View style={[styles.purchaseSummaryCard, { marginTop: 8, marginBottom: 0 }]}>
                        <View style={styles.purchaseSummaryRow}>
                            <Text style={styles.purchaseSummaryLabel}>{UI_TEXT.UNIT_PRICE}</Text>
                            <Text style={styles.purchaseSummaryValue}>{selectedPrice ? `${selectedPrice.price.toFixed(2)}$` : '—'}</Text>
                        </View>
                        <View style={[styles.purchaseSummaryRow, { borderTopWidth: 1, borderColor: '#eee', marginTop: 6, paddingTop: 6 }]}>
                            <Text style={styles.purchaseSummaryLabel}>{UI_TEXT.TOTAL}</Text>
                            <Text style={styles.purchaseTotalText}>{total > 0 ? `${total.toFixed(2)}$` : '—'}</Text>
                        </View>
                    </View>
                    <View style={{ gap: 10, marginTop: 12 }}>
                        <PrimaryButton title={UI_TEXT.RECORD_PURCHASE} disabled={recording || !selectedPrice} loading={recording} onPress={handleRecord} />
                        <SecondaryButton title={UI_TEXT.VIEW_HISTORY} onPress={() => navigation.navigate(ROUTES.PURCHASE_DETAILS)} />
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 8 }}>
                    <Text style={styles.recentPurchasesTitle}>{UI_TEXT.RECENT_PURCHASES}</Text>
                    <RNText style={{ fontSize: 12, color: '#999' }}>{recent.length > 0 ? `${recent.length} total` : ''}</RNText>
                </View>
                <FlatList
                    data={recent.slice(0, 5)}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.purchaseItemRow}>
                            <View style={styles.sellerInfo}>
                                <RNText style={styles.purchaseItemTitle}>{item.category} × {item.quantity} ({item.unit})</RNText>
                                {!!item.seller_name && <RNText style={styles.sellerPhoneText}>{UI_TEXT.SOLD_BY}: {item.seller_name}</RNText>}
                            </View>
                            <RNText style={styles.purchaseItemTotal}>{item.total.toFixed(2)}$</RNText>
                        </View>
                    )}
                    ListEmptyComponent={<EmptyState icon="receipt-outline" title={UI_TEXT.EMPTY_PURCHASE_LIST} description="Record your first purchase to see it here" />}
                />
            </View>
        </SafeAreaView>
    )
}
