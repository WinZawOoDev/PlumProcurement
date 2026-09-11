import { FlatList, Pressable, ScrollView, Text as RNText, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Text } from '@rneui/base'
import { useTheme } from '@rneui/themed'
import { useTranslation } from 'react-i18next'
import Ionicons from '@react-native-vector-icons/ionicons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStyles } from '../../styles'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { ROUTES, SAFE_AREA, PAGINATION_CONFIG } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { usePrices } from '../../context/PriceContext'
import { purchaseService } from '../../services/purchaseService'
import { IPurchaseDetail, IPrice } from '../../types/database'
import { showSuccess, showError } from '../../utils/notifications'
import { formatNumber } from '../../utils'
import { useLoading } from '../../hooks/useAsync'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { QuantityCounter } from '../../components/QuantityCounter'

interface SelectedSeller {
    id: number
    name: string
}

interface PurchaseFormProps {
    selectedSeller: SelectedSeller | null
    onOpenSellerSelect: () => void
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
    const { t } = useTranslation()
    const { UNITS, CURRENCY } = useLocalizedConstants()
    const selected = quantity > 0
    const lineTotal = price.price * quantity
    return (
        <View style={[styles.priceItemCard, { width }]}>
            <View style={styles.priceItemCardHeader}>
                <View style={styles.priceItemCardHeaderText}>
                    <RNText style={styles.priceItemCardTitle}>{t(`categories.${price.category}`, { defaultValue: price.category })}</RNText>
                    <RNText style={styles.priceItemCardUnit}>{UNITS[price.unit] ?? price.unit}</RNText>
                </View>
                <View style={styles.priceItemCardPriceBlock}>
                    <RNText style={styles.priceItemCardPrice}>{formatNumber(price.price)}</RNText>
                    <RNText style={styles.priceItemCardCurrency}>{CURRENCY}</RNText>
                </View>
            </View>
            <QuantityCounter
                value={quantity}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                label={t(`categories.${price.category}`, { defaultValue: price.category })}
            />
            {selected && (
                <View style={styles.priceItemCardFooter}>
                    <RNText style={styles.priceItemCardFooterCalc}>
                        {formatNumber(quantity, 0)} × {formatNumber(price.price)}{CURRENCY}
                    </RNText>
                    <RNText style={styles.priceItemCardFooterTotal}>{formatNumber(lineTotal)}{CURRENCY}</RNText>
                </View>
            )}
        </View>
    )
}

function PurchaseSummary({ itemCount, total, onPress }: { itemCount: number; total: number; onPress: () => void }) {
    const styles = useStyles()
    const { UI_TEXT, CURRENCY } = useLocalizedConstants()
    const hasItems = itemCount > 0
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
                <Text style={styles.purchaseSummaryLabel}>{UI_TEXT.TOTAL_ITEMS}</Text>
                <Text style={[styles.purchaseSummaryValue, !hasItems && styles.purchaseSummaryValueMuted]}>{formatNumber(itemCount, 0)}</Text>
            </View>
            <View style={[styles.purchaseSummaryRow, styles.purchaseSummaryDivider]}>
                <Text style={styles.purchaseSummaryLabel}>{UI_TEXT.TOTAL_AMOUNT}</Text>
                <Text style={[styles.purchaseTotalText, total <= 0 && styles.purchaseSummaryValueMuted]}>
                    {total > 0 ? `${formatNumber(total)}${CURRENCY}` : '—'}
                </Text>
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
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <View style={styles.formActions}>
            <PrimaryButton title={UI_TEXT.RECORD_PURCHASE} disabled={recording || !canRecord} loading={recording} onPress={onRecord} />
            <SecondaryButton title={UI_TEXT.VIEW_HISTORY} onPress={onViewHistory} />
        </View>
    )
}

export const PurchaseForm = React.memo(function PurchaseForm({ selectedSeller, onOpenSellerSelect, onRecorded }: PurchaseFormProps) {
    const styles = useStyles()
    const { theme } = useTheme()
    const { UI_TEXT, MESSAGES } = useLocalizedConstants()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const { prices } = usePrices()
    const { width } = useWindowDimensions()
    const cardWidth = width - 78

    const [quantities, setQuantities] = useState<Record<string, number>>({})
    const [activeCardIndex, setActiveCardIndex] = useState(0)
    const { loading: recording, withLoading: withRecording } = useLoading(false)

    const selectablePrices = prices

    // pagingEnabled snaps by the viewport, which equals the card width here.
    const handleCardsScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const next = Math.round(event.nativeEvent.contentOffset.x / cardWidth)
        const clamped = Math.min(selectablePrices.length - 1, Math.max(0, next))
        setActiveCardIndex((prev) => (prev === clamped ? prev : clamped))
    }

    const getQuantity = (priceId: string) => quantities[priceId] ?? 0
    const increment = (priceId: string) => {
        setQuantities((prev) => ({ ...prev, [priceId]: (prev[priceId] ?? 0) + 1 }))
    }
    const decrement = (priceId: string) => {
        setQuantities((prev) => ({ ...prev, [priceId]: Math.max(0, (prev[priceId] ?? 0) - 1) }))
    }

    const selectedItems = selectablePrices
        .map((price) => ({ price, quantity: getQuantity(price.id.toString()) }))
        .filter((r) => r.quantity > 0)
    const allValid = selectedSeller !== null && selectedItems.length > 0
    const total = selectedItems.reduce((sum, r) => sum + r.price.price * r.quantity, 0)

    const summaryPurchase: IPurchaseDetail = {
        id: 0,
        seller_id: selectedSeller?.id ?? null,
        total,
        seller_name: selectedSeller?.name ?? null,
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
        if (!selectedSeller) {
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
                    seller_id: selectedSeller.id,
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
                setQuantities({})
            } catch (error) {
                const message = error instanceof Error ? error.message : MESSAGES.ERROR_GENERIC
                showError(message)
            }
        })
    }

    return (
        <View style={styles.formCard}>
            <Pressable
                style={styles.purchaseItemRow}
                onPress={onOpenSellerSelect}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${UI_TEXT.SELECT_SELLER}: ${selectedSeller?.name ?? UI_TEXT.SELECT_SELLER_PLACEHOLDER}`}
            >
                <View style={styles.sellerInfo}>
                    <RNText style={styles.purchaseItemSubtitle}>{UI_TEXT.SELECT_SELLER}</RNText>
                    <RNText
                        style={[
                            styles.purchaseItemTitle,
                            !selectedSeller && styles.purchaseSummaryValueMuted,
                        ]}
                    >
                        {selectedSeller?.name ?? UI_TEXT.SELECT_SELLER_PLACEHOLDER}
                    </RNText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.grey4} />
            </Pressable>
            {selectablePrices.length === 0 ? (
                <EmptyState compact icon="pricetag-outline" title={MESSAGES.EMPTY_PRICE_LIST} description={UI_TEXT.SELECT_SELLER_AND_PRICE_FIRST} />
            ) : (
                <>
                    <View style={styles.priceItemListHeader}>
                        <RNText style={styles.priceItemListTitle}>{UI_TEXT.PRICE_ITEMS}</RNText>
                        <RNText style={styles.priceItemCount}>{formatNumber(selectablePrices.length, 0)}</RNText>
                    </View>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleCardsScroll}
                        scrollEventThrottle={16}
                        style={styles.priceItemCardScroll}
                        contentContainerStyle={styles.priceItemCardList}
                    >
                        {selectablePrices.map((price) => {
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
                    {selectablePrices.length > 1 && (
                        <View style={styles.priceItemDotsRow}>
                            {selectablePrices.map((price, index) => (
                                <View
                                    key={price.id}
                                    style={[styles.priceItemDot, index === activeCardIndex && styles.priceItemDotActive]}
                                />
                            ))}
                        </View>
                    )}
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
})

interface RecentPurchasesListProps {
    recent: IPurchaseDetail[]
    count: number
}

function RecentPurchaseRow({ item }: { item: IPurchaseDetail }) {
    const styles = useStyles()
    const { t } = useTranslation()
    const { UI_TEXT, UNITS, CURRENCY } = useLocalizedConstants()
    const single = item.items.length === 1 ? item.items[0] : null
    const title = single
        ? `${t(`categories.${single.category}`, { defaultValue: single.category })} × ${formatNumber(single.quantity, 0)} (${UNITS[single.unit] ?? single.unit})`
        : `${formatNumber(item.items.length, 0)} ${UI_TEXT.ITEMS.toLowerCase()}`
    return (
        <View style={styles.purchaseItemRow}>
            <View style={styles.sellerInfo}>
                <RNText style={styles.purchaseItemTitle}>{title}</RNText>
                {!!item.seller_name && <RNText style={styles.sellerPhoneText}>{UI_TEXT.SOLD_BY}: {item.seller_name}</RNText>}
            </View>
            <RNText style={styles.purchaseItemTotal}>{formatNumber(item.total)}{CURRENCY}</RNText>
        </View>
    )
}

const RecentPurchasesList = React.memo(function RecentPurchasesList({ recent, count }: RecentPurchasesListProps) {
    const styles = useStyles()
    const { t } = useTranslation()
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <>
            <View style={styles.recentPurchasesHeader}>
                <Text style={styles.recentPurchasesTitle}>{UI_TEXT.RECENT_PURCHASES}</Text>
                <RNText style={styles.recentPurchasesCount}>{count > 0 ? t('uiText.TOTAL_COUNT', { count }) : ''}</RNText>
            </View>
            <FlatList
                style={styles.recentPurchasesList}
                contentContainerStyle={recent.length === 0 ? styles.recentPurchasesEmpty : undefined}
                scrollEnabled={recent.length > 0}
                data={recent}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <RecentPurchaseRow item={item} />}
                ListEmptyComponent={<EmptyState compact icon="receipt-outline" title={UI_TEXT.EMPTY_PURCHASE_LIST} description={UI_TEXT.EMPTY_PURCHASE_HINT} />}
            />
        </>
    )
})

export default function Purchase() {
    const styles = useStyles()
    const { t } = useTranslation()
    const { UI_TEXT } = useLocalizedConstants()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const { refresh: refreshPrices } = usePrices()
    const route = useRoute<
        RouteProp<Record<string, { selectedSellerId?: number; selectedSellerName?: string }>, string>
    >()

    const [selectedSeller, setSelectedSeller] = useState<SelectedSeller | null>(null)
    const [recent, setRecent] = useState<IPurchaseDetail[]>([])
    const [purchaseCount, setPurchaseCount] = useState(0)

    // Consume seller selection returned from the SellerSelect screen.
    // Committed immediately (re-render is memoized, so it stays cheap) —
    // waiting for the transition to finish made the round-trip feel slow.
    useEffect(() => {
        const { selectedSellerId, selectedSellerName } = route.params ?? {}
        if (selectedSellerId === undefined || selectedSellerName === undefined) {
            return
        }
        setSelectedSeller({ id: selectedSellerId, name: selectedSellerName })
        navigation.setParams({ selectedSellerId: undefined, selectedSellerName: undefined })
    }, [route.params, navigation])

    const loadRecent = useCallback(async () => {
        try {
            const [items, count] = await Promise.all([
                purchaseService.getRecentPurchases(PAGINATION_CONFIG.RECENT_PURCHASES_LIMIT),
                purchaseService.getPurchaseCount(),
            ])
            setRecent(items)
            setPurchaseCount(count)
        } catch (error) {
            showError((error as Error)?.message ?? t('messages.ERROR_GENERIC'))
        }
    }, [t])

    // Reload on every focus so returning from history/detail screens shows fresh data
    useFocusEffect(
        useCallback(() => {
            loadRecent()
            refreshPrices()
        }, [loadRecent, refreshPrices])
    )

    // Stable callbacks so memoized children skip re-renders when only the
    // seller selection (or nothing) changes.
    const handleOpenSellerSelect = useCallback(() => {
        navigation.navigate(ROUTES.SELECT_SELLER, { currentSellerId: selectedSeller?.id })
    }, [navigation, selectedSeller])

    const handleRecorded = useCallback(() => {
        loadRecent()
        setSelectedSeller(null)
    }, [loadRecent])

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={[styles.priceListContainer, styles.fillContainer]}>
                <SectionHeader icon="cart-outline" title={UI_TEXT.RECORD_PURCHASE} description={UI_TEXT.PURCHASE_DESCRIPTION} />

                <PurchaseForm
                    selectedSeller={selectedSeller}
                    onOpenSellerSelect={handleOpenSellerSelect}
                    onRecorded={handleRecorded}
                />

                <RecentPurchasesList recent={recent} count={purchaseCount} />
            </View>
        </SafeAreaView>
    )
}
