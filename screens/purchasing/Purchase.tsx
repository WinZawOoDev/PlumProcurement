import { FlatList, Text as RNText, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Text } from '@rneui/base'
import { useTheme } from '@rneui/themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { PrimaryButton, SecondaryButton, IconButton } from '../../components/buttons/Button'
import { UI_TEXT, MESSAGES, ROUTES, SAFE_AREA, QUANTITY_PATTERN } from '../../constants'
import { usePrices } from '../../context/PriceContext'
import { purchaseService } from '../../services/purchaseService'
import { sellerService } from '../../services/sellerService'
import { IPurchaseDetail, IPrice } from '../../types/database'
import { SelectPicker } from '../../components/SelectPicker'
import { QuantityStepper } from '../../components/QuantityStepper'
import { showSuccess, showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'

interface DraftItem {
    key: string
    priceId: string
    quantity: string
}

const newDraftItem = (): DraftItem => ({ key: String(Date.now()) + Math.random().toString(36).slice(2), priceId: '', quantity: '1' })

interface PurchaseFormProps {
    sellers: { id: number; name: string }[]
    onRecorded: () => void
}

function PurchaseItemEditor({
    item,
    prices,
    onChange,
    onRemove,
    canRemove,
}: {
    item: DraftItem
    prices: IPrice[]
    onChange: (next: DraftItem) => void
    onRemove: () => void
    canRemove: boolean
}) {
    const styles = useStyles()
    const { theme } = useTheme()
    const available = prices.filter((p) => Boolean(p.is_available))
    const selectedPrice = available.find((p) => p.id.toString() === item.priceId)

    return (
        <View style={styles.purchaseItemEditor}>
            <SelectPicker
                label={UI_TEXT.SELECT_PRICE_ITEM}
                selectedValue={item.priceId}
                onValueChange={(priceId) => onChange({ ...item, priceId })}
                items={[
                    { label: UI_TEXT.SELECT_PRICE_ITEM, value: '' },
                    ...available.map((p) => ({
                        label: `${p.category} - ${p.price.toFixed(2)}$ / ${p.unit}`,
                        value: p.id.toString(),
                    })),
                ]}
            />
            <QuantityStepper
                value={item.quantity}
                onChange={(quantity) => onChange({ ...item, quantity })}
                disabled={!selectedPrice}
            />
            <View style={styles.purchaseItemEditorFooter}>
                <IconButton
                    icon={<Ionicons name="trash-outline" size={18} color={theme.colors.error} />}
                    variant="ghost"
                    onPress={onRemove}
                    disabled={!canRemove}
                    accessibilityLabel={`${UI_TEXT.REMOVE_ITEM} ${item.key}`}
                />
            </View>
        </View>
    )
}

function PurchaseSummary({ itemCount, total }: { itemCount: number; total: number }) {
    const styles = useStyles()
    return (
        <View style={[styles.purchaseSummaryCard, styles.purchaseSummaryCardInline]}>
            <View style={styles.purchaseSummaryRow}>
                <Text style={styles.purchaseSummaryLabel}>{UI_TEXT.ITEMS}</Text>
                <Text style={styles.purchaseSummaryValue}>{itemCount}</Text>
            </View>
            <View style={[styles.purchaseSummaryRow, styles.purchaseSummaryDivider]}>
                <Text style={styles.purchaseSummaryLabel}>{UI_TEXT.TOTAL}</Text>
                <Text style={styles.purchaseTotalText}>{total > 0 ? `${total.toFixed(2)}$` : '—'}</Text>
            </View>
        </View>
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

    const [selectedSellerId, setSelectedSellerId] = useState<string>('')
    const [items, setItems] = useState<DraftItem[]>([newDraftItem()])
    const { loading: recording, withLoading: withRecording } = useLoading(false)

    const available = prices.filter((p) => Boolean(p.is_available))
    const resolvedItems = items.map((item) => {
        const price = available.find((p) => p.id.toString() === item.priceId)
        const quantityValue = parseInt(item.quantity, 10)
        const valid = Boolean(price) && QUANTITY_PATTERN.test(item.quantity) && quantityValue > 0
        return { item, price, quantityValue, valid }
    })
    const allValid = selectedSellerId !== '' && resolvedItems.length > 0 && resolvedItems.every((r) => r.valid)
    const total = resolvedItems.reduce((sum, r) => (r.valid ? sum + r.price!.price * r.quantityValue : sum), 0)

    const handleRecord = async () => {
        if (!selectedSellerId) {
            showError(MESSAGES.ERROR_SELECT_SELLER)
            return
        }
        const validItems = resolvedItems.filter((r) => r.valid)
        if (validItems.length === 0) {
            showError(MESSAGES.ERROR_NO_ITEMS)
            return
        }
        await withRecording(async () => {
            try {
                await purchaseService.recordPurchase({
                    seller_id: parseInt(selectedSellerId, 10),
                    items: validItems.map(({ price, quantityValue }) => ({
                        price_id: price!.id,
                        category: price!.category,
                        unit: price!.unit,
                        unit_price: price!.price,
                        quantity: quantityValue,
                    })),
                })
                showSuccess(MESSAGES.PURCHASE_RECORDED_SUCCESS)
                onRecorded()
                setSelectedSellerId('')
                setItems([newDraftItem()])
            } catch (error) {
                const message = error instanceof Error ? error.message : MESSAGES.ERROR_GENERIC
                showError(message)
            }
        })
    }

    const updateItem = (key: string, next: DraftItem) => {
        setItems((prev) => prev.map((it) => (it.key === key ? next : it)))
    }
    const removeItem = (key: string) => {
        setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.key !== key) : prev))
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
            {resolvedItems.map(({ item }) => (
                <PurchaseItemEditor
                    key={item.key}
                    item={item}
                    prices={available}
                    onChange={(next) => updateItem(item.key, next)}
                    onRemove={() => removeItem(item.key)}
                    canRemove={items.length > 1}
                />
            ))}
            <View style={styles.purchaseItemEditorFooter}>
                <SecondaryButton
                    title={UI_TEXT.ADD_ITEM}
                    onPress={() => setItems((prev) => [...prev, newDraftItem()])}
                    buttonStyle={styles.addItemButton}
                    titleStyle={styles.addItemButtonTitle}
                />
            </View>
            {!allValid && (
                <RNText style={styles.quantityStepperHint}>{UI_TEXT.SELECT_SELLER_AND_PRICE_FIRST}</RNText>
            )}
            <PurchaseSummary itemCount={resolvedItems.filter((r) => r.valid).length} total={total} />
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
