import { FlatList, Text as RNText, ToastAndroid, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Picker } from '@react-native-picker/picker'
import { Text } from '@rneui/base'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStyles } from '../../styles'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { UI_TEXT, MESSAGES, ROUTES, SAFE_AREA, A11Y_LABELS } from '../../constants'
import { usePrices } from '../../context/PriceContext'
import { purchaseService } from '../../services/purchaseService'
import { sellerService } from '../../services/sellerService'
import { IPurchaseWithSeller } from '../../database'

const QUANTITY_PATTERN = /^\d+$/

export default function Purchase() {
    const styles = useStyles()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const { prices, refresh: refreshPrices } = usePrices()

    const [selectedPriceId, setSelectedPriceId] = useState<string>('')
    const [selectedSellerId, setSelectedSellerId] = useState<string>('')
    const [sellers, setSellers] = useState<{ id: number; name: string }[]>([])
    const [quantity, setQuantity] = useState('1')
    const [recent, setRecent] = useState<IPurchaseWithSeller[]>([])
    const [recording, setRecording] = useState(false)

    const loadRecent = useCallback(async () => {
        try {
            setRecent(await purchaseService.getPurchases())
        } catch (error) {
            console.error('Failed to fetch purchases:', error)
        }
    }, [])

    const loadSellers = useCallback(async () => {
        try {
            setSellers(await sellerService.getSellers())
        } catch (error) {
            console.error('Failed to fetch sellers:', error)
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
            ToastAndroid.show(UI_TEXT.SELECT_PRICE_ITEM, ToastAndroid.SHORT)
            return
        }
        if (!QUANTITY_PATTERN.test(quantity) || quantityValue <= 0) {
            ToastAndroid.show(MESSAGES.ERROR_INVALID_QUANTITY, ToastAndroid.LONG)
            return
        }
        setRecording(true)
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
            ToastAndroid.show(MESSAGES.PURCHASE_RECORDED_SUCCESS, ToastAndroid.SHORT)
            await loadRecent()
            setQuantity('1')
        } catch (error) {
            const message = error instanceof Error ? error.message : MESSAGES.ERROR_GENERIC
            ToastAndroid.show(message, ToastAndroid.LONG)
        } finally {
            setRecording(false)
        }
    }

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={styles.priceListContainer}>
                <View style={styles.titleDescription}>
                    <Text style={styles.titleText}>{UI_TEXT.RECORD_PURCHASE}</Text>
                    <Text style={styles.descriptionText}>{UI_TEXT.PURCHASE_DESCRIPTION}</Text>
                </View>

                <View style={styles.categoryContainer}>
                    <Text style={styles.categoryLabel}>{UI_TEXT.SELECT_SELLER}</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={selectedSellerId}
                            onValueChange={(value) => setSelectedSellerId(value as string)}
                            style={styles.picker}
                            mode="dialog"
                        >
                            <Picker.Item label={UI_TEXT.NO_SELLER} value="" />
                            {sellers.map((s) => (
                                <Picker.Item
                                    key={s.id}
                                    label={s.name}
                                    value={s.id.toString()}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.categoryContainer}>
                    <Text style={styles.categoryLabel}>{UI_TEXT.SELECT_PRICE_ITEM}</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={selectedPriceId}
                            onValueChange={(value) => setSelectedPriceId(value as string)}
                            style={styles.picker}
                            mode="dialog"
                        >
                            <Picker.Item label={UI_TEXT.SELECT_PRICE_ITEM} value="" />
                            {prices.map((p) => (
                                <Picker.Item
                                    key={p.id}
                                    label={`${p.category} - ${p.price.toFixed(2)}$ / ${p.unit}`}
                                    value={p.id.toString()}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.quantityRow}>
                    <Text style={styles.categoryLabel}>{UI_TEXT.QUANTITY}</Text>
                    <RNText
                        style={styles.quantityStepperButton}
                        onPress={() => setQuantity((q) => String(Math.max(1, parseInt(q, 10) || 1) + 1))}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={A11Y_LABELS.INCREASE_QUANTITY}
                    >
                        +
                    </RNText>
                    <RNText style={styles.quantityValue}>{quantity}</RNText>
                    <RNText
                        style={styles.quantityStepperButton}
                        onPress={() => setQuantity((q) => String(Math.max(1, (parseInt(q, 10) || 1) - 1)))}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={A11Y_LABELS.DECREASE_QUANTITY}
                    >
                        −
                    </RNText>
                </View>

                <View style={styles.purchaseSummaryRow}>
                    <Text style={styles.purchaseSummaryLabel}>{UI_TEXT.UNIT_PRICE}</Text>
                    <Text style={styles.purchaseSummaryValue}>
                        {selectedPrice ? `${selectedPrice.price.toFixed(2)}$` : '—'}
                    </Text>
                </View>
                <View style={styles.purchaseSummaryRow}>
                    <Text style={styles.purchaseSummaryLabel}>{UI_TEXT.TOTAL}</Text>
                    <Text style={styles.purchaseTotalText}>{total > 0 ? `${total.toFixed(2)}$` : '—'}</Text>
                </View>

                <PrimaryButton
                    title={UI_TEXT.RECORD_PURCHASE}
                    disabled={recording || !selectedPrice}
                    loading={recording}
                    onPress={handleRecord}
                />
                <SecondaryButton
                    title={UI_TEXT.VIEW_HISTORY}
                    onPress={() => navigation.navigate(ROUTES.PURCHASE_DETAILS)}
                />

                <Text style={styles.recentPurchasesTitle}>{UI_TEXT.RECENT_PURCHASES}</Text>
                <FlatList
                    data={recent.slice(0, 5)}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.purchaseItemRow}>
                            <View style={styles.sellerInfo}>
                                <RNText style={styles.purchaseItemTitle}>
                                    {item.category} × {item.quantity} ({item.unit})
                                </RNText>
                                {!!item.seller_name && (
                                    <RNText style={styles.sellerPhoneText}>
                                        {UI_TEXT.SOLD_BY}: {item.seller_name}
                                    </RNText>
                                )}
                            </View>
                            <RNText style={styles.purchaseItemTotal}>{item.total.toFixed(2)}$</RNText>
                        </View>
                    )}
                    ListEmptyComponent={
                        <RNText style={styles.emptyPriceListText}>
                            {UI_TEXT.EMPTY_PURCHASE_LIST}
                        </RNText>
                    }
                />
            </View>
        </SafeAreaView>
    )
}
