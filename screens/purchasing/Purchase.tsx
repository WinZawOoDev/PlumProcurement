import { FlatList, ScrollView, Text as RNText, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Text } from '@rneui/base'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStyles } from '../../styles'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { UI_TEXT, MESSAGES, ROUTES, SAFE_AREA, A11Y_LABELS } from '../../constants'
import { usePrices } from '../../context/PriceContext'
import { purchaseService } from '../../services/purchaseService'
import { sellerService } from '../../services/sellerService'
import { IPurchaseDetail, IPrice } from '../../types/database'
import { SelectPicker } from '../../components/SelectPicker'
import { showSuccess, showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { lightHaptic } from '../../utils/haptics'

interface PurchaseFormProps {
    sellers: { id: number; name: string }[]
    onRecorded: () => void
}

function PriceItemCard({
    price,
    quantity,
    width,
    onIncrease,
    onDecrease,
}: {
    price: IPrice
    quantity: number
    width: number
    onIncrease: () => void
    onDecrease: () => void
}) {
    const styles = useStyles()
    const selected = quantity > 0
    const lineTotal = price.price * quantity
    return (
        <View style={[styles.priceItemCard, { width }]}>
            <View style={styles.priceItemCardHeader}>
                <View style={styles.priceItemCardHeaderText}>
                    <RNText style={styles.priceItemCardTitle}>{price.category}</RNText>
                    <RNText style={styles.priceItemCardUnit}>{price.unit}</RNText>
                </View>
                <View style={styles.priceItemCardPriceBlock}>
                    <RNText style={styles.priceItemCardPrice}>{price.price.toFixed(2)}</RNText>
                    <RNText style={styles.priceItemCardCurrency}>$</RNText>
                </View>
            </View>
            <View style={[styles.priceItemCardCounter, selected && styles.priceItemCardCounterActive]}>
                <TouchableOpacity
                    style={[styles.priceItemCardStepperButton, !selected && styles.priceItemCardStepperButtonDisabled]}
                    onPress={() => {
                        lightHaptic()
                        onDecrease()
                    }}
                    disabled={!selected}
                    activeOpacity={0.6}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`${A11Y_LABELS.DECREASE_QUANTITY} ${price.category}`}
                    accessibilityState={{ disabled: !selected }}
                >
                    <RNText style={styles.priceItemCardStepperButtonText}>−</RNText>
                </TouchableOpacity>
                <View style={styles.priceItemCardValueBubble}>
                    <RNText style={[styles.priceItemCardValue, selected && styles.priceItemCardValueActive]}>{quantity}</RNText>
                </View>
                <TouchableOpacity
                    style={[styles.priceItemCardStepperButton, styles.priceItemCardStepperButtonPlus]}
                    onPress={() => {
                        lightHaptic()
                        onIncrease()
                    }}
                    activeOpacity={0.6}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`${A11Y_LABELS.INCREASE_QUANTITY} ${price.category}`}
                >
                    <RNText style={styles.priceItemCardStepperButtonTextPlus}>+</RNText>
                </TouchableOpacity>
            </View>
            {selected && (
                <View style={styles.priceItemCardFooter}>
                    <RNText style={styles.priceItemCardFooterCalc}>
                        {quantity} × {price.price.toFixed(2)}$
                    </RNText>
                    <RNText style={styles.priceItemCardFooterTotal}>{lineTotal.toFixed(2)}$</RNText>
                </View>
            )}
        </View>
    )
}

function PurchaseSummary({ itemCount, total, onPress }: { itemCount: number; total: number; onPress: () => void }) {
    const styles = useStyles()
    return (
        <TouchableOpacity
            style={[styles.purchaseSummaryCard, styles.purchaseSummaryCardInline]}
            onPress={onPress}
            activeOpacity={0.7}
            accessible
            accessibilityRole="button"
            accessibilityLabel={UI_TEXT.PURCHASE_SUMMARY_TITLE}
        >
            <View style={styles.purchaseSummaryRow}>
                <Text style={styles.purchaseSummaryLabel}>{UI_TEXT.ITEMS}</Text>
                <Text style={styles.purchaseSummaryValue}>{itemCount}</Text>
            </View>
            <View style={[styles.purchaseSummaryRow, styles.purchaseSummaryDivider]}>
                <Text style={styles.purchaseSummaryLabel}>{UI_TEXT.TOTAL}</Text>
                <Text style={styles.purchaseTotalText}>{total > 0 ? `${total.toFixed(2)}$` : '—'}</Text>
            </View>
        </TouchableOpacity>
    )
}

function PurchaseFormActions({
    recording,
    canRecord,
    onRecord,
    onViewHistory,
}: {
    recording: boolean
    canRecord: boolean
    onRecord: () => void
    onViewHistory: () => void
}) {
    const styles = useStyles()
    return (
        <View style={styles.formActions}>
            <PrimaryButton title={UI_TEXT.RECORD_PURCHASE} disabled={recording || !canRecord} loading={recording} onPress={onRecord} />
            <SecondaryButton title={UI_TEXT.VIEW_HISTORY} onPress={onViewHistory} />
        </View>
    )
}

export function PurchaseForm({ sellers, onRecorded }: PurchaseFormProps) {
    const styles = useStyles()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const { prices } = usePrices()
    const { width } = useWindowDimensions()
    const cardWidth = width - 78

    const [selectedSellerId, setSelectedSellerId] = useState<string>('')
    const [quantities, setQuantities] = useState<Record<string, number>>({})
    const { loading: recording, withLoading: withRecording } = useLoading(false)

    const available = prices.filter((p) => Boolean(p.is_available))

    const getQuantity = (priceId: string) => quantities[priceId] ?? 0
    const increment = (priceId: string) => {
        setQuantities((prev) => ({ ...prev, [priceId]: (prev[priceId] ?? 0) + 1 }))
    }
    const decrement = (priceId: string) => {
        setQuantities((prev) => ({ ...prev, [priceId]: Math.max(0, (prev[priceId] ?? 0) - 1) }))
    }

    const selectedItems = available
        .map((price) => ({ price, quantity: getQuantity(price.id.toString()) }))
        .filter((r) => r.quantity > 0)
    const allValid = selectedSellerId !== '' && selectedItems.length > 0
    const total = selectedItems.reduce((sum, r) => sum + r.price.price * r.quantity, 0)

    const summaryPurchase: IPurchaseDetail = {
        id: 0,
        seller_id: selectedSellerId ? parseInt(selectedSellerId, 10) : null,
        total,
        seller_name: sellers.find((s) => s.id.toString() === selectedSellerId)?.name ?? null,
        items: selectedItems.map(({ price, quantity }) => ({
            id: price.id,
            purchase_id: 0,
            price_id: price.id,
            category: price.category,
            unit: price.unit,
            unit_price: price.price,
            quantity,
            line_total: price.price * quantity,
        })),
    }

    const handleRecord = async () => {
        if (!selectedSellerId) {
            showError(MESSAGES.ERROR_SELECT_SELLER)
            return
        }
        if (selectedItems.length === 0) {
            showError(MESSAGES.ERROR_NO_ITEMS)
            return
        }
        await withRecording(async () => {
            try {
                await purchaseService.recordPurchase({
                    seller_id: parseInt(selectedSellerId, 10),
                    items: selectedItems.map(({ price, quantity }) => ({
                        price_id: price.id,
                        category: price.category,
                        unit: price.unit,
                        unit_price: price.price,
                        quantity,
                    })),
                })
                showSuccess(MESSAGES.PURCHASE_RECORDED_SUCCESS)
                onRecorded()
                setSelectedSellerId('')
                setQuantities({})
            } catch (error) {
                const message = error instanceof Error ? error.message : MESSAGES.ERROR_GENERIC
                showError(message)
            }
        })
    }

    return (
        <View style={styles.formCard}>
            <SelectPicker
                label={UI_TEXT.SELECT_SELLER}
                selectedValue={selectedSellerId}
                onValueChange={setSelectedSellerId}
                items={[
                    { label: UI_TEXT.SELECT_SELLER_PLACEHOLDER, value: '' },
                    ...sellers.map((s) => ({ label: s.name, value: s.id.toString() })),
                ]}
            />
            {available.length === 0 ? (
                <EmptyState compact icon="pricetag-outline" title={MESSAGES.EMPTY_PRICE_LIST} description={UI_TEXT.SELECT_SELLER_AND_PRICE_FIRST} />
            ) : (
                <>
                    <View style={styles.priceItemListHeader}>
                        <RNText style={styles.priceItemListTitle}>{UI_TEXT.PRICE_ITEMS}</RNText>
                        <RNText style={styles.priceItemCount}>{available.length}</RNText>
                    </View>
                    <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.priceItemCardScroll}
                    contentContainerStyle={styles.priceItemCardList}
                >
                    {available.map((price) => {
                        const priceId = price.id.toString()
                        const quantity = getQuantity(priceId)
                        return (
                            <PriceItemCard
                                key={price.id}
                                price={price}
                                quantity={quantity}
                                width={cardWidth}
                                onIncrease={() => increment(priceId)}
                                onDecrease={() => decrement(priceId)}
                            />
                        )
                    })}
                    </ScrollView>
                </>
            )}
            {!allValid && (
                <RNText style={styles.quantityStepperHint}>{UI_TEXT.SELECT_SELLER_AND_PRICE_FIRST}</RNText>
            )}
            <PurchaseSummary
                itemCount={selectedItems.length}
                total={total}
                onPress={() => navigation.navigate(ROUTES.PURCHASE_SUMMARY, { purchase: summaryPurchase })}
            />
            <PurchaseFormActions
                recording={recording}
                canRecord={allValid}
                onRecord={handleRecord}
                onViewHistory={() => navigation.navigate(ROUTES.PURCHASE_DETAILS)}
            />
        </View>
    )
}

interface RecentPurchasesListProps {
    recent: IPurchaseDetail[]
}

function RecentPurchaseRow({ item }: { item: IPurchaseDetail }) {
    const styles = useStyles()
    const single = item.items.length === 1 ? item.items[0] : null
    const title = single
        ? `${single.category} × ${single.quantity} (${single.unit})`
        : `${item.items.length} ${UI_TEXT.ITEMS.toLowerCase()}`
    return (
        <View style={styles.purchaseItemRow}>
            <View style={styles.sellerInfo}>
                <RNText style={styles.purchaseItemTitle}>{title}</RNText>
                {!!item.seller_name && <RNText style={styles.sellerPhoneText}>{UI_TEXT.SOLD_BY}: {item.seller_name}</RNText>}
            </View>
            <RNText style={styles.purchaseItemTotal}>{item.total.toFixed(2)}$</RNText>
        </View>
    )
}

function RecentPurchasesList({ recent }: RecentPurchasesListProps) {
    const styles = useStyles()
    return (
        <>
            <View style={styles.recentPurchasesHeader}>
                <Text style={styles.recentPurchasesTitle}>{UI_TEXT.RECENT_PURCHASES}</Text>
                <RNText style={styles.recentPurchasesCount}>{recent.length > 0 ? `${recent.length} total` : ''}</RNText>
            </View>
            <FlatList
                style={styles.recentPurchasesList}
                contentContainerStyle={recent.length === 0 ? styles.recentPurchasesEmpty : undefined}
                scrollEnabled={recent.length > 0}
                data={recent.slice(0, 4)}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <RecentPurchaseRow item={item} />}
                ListEmptyComponent={<EmptyState compact icon="receipt-outline" title={UI_TEXT.EMPTY_PURCHASE_LIST} description="Record your first purchase to see it here" />}
            />
        </>
    )
}

export default function Purchase() {
    const styles = useStyles()
    const { refresh: refreshPrices } = usePrices()

    const [sellers, setSellers] = useState<{ id: number; name: string }[]>([])
    const [recent, setRecent] = useState<IPurchaseDetail[]>([])

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

    // Reload on every focus so returning from history/detail screens shows fresh data
    useFocusEffect(
        useCallback(() => {
            loadRecent()
            loadSellers()
            refreshPrices()
        }, [loadRecent, loadSellers, refreshPrices])
    )

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={[styles.priceListContainer, styles.fillContainer]}>
                <SectionHeader icon="cart-outline" title={UI_TEXT.RECORD_PURCHASE} description={UI_TEXT.PURCHASE_DESCRIPTION} />

                <PurchaseForm sellers={sellers} onRecorded={loadRecent} />

                <RecentPurchasesList recent={recent} />
            </View>
        </SafeAreaView>
    )
}
