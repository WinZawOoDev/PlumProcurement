import { FlatList, RefreshControl, Text as RNText, View } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from '@rneui/themed'
import { useTranslation } from 'react-i18next'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { PAGINATION_CONFIG, SAFE_AREA } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { paymentService } from '../../services/paymentService'
import { IPayment, ISellerPaymentStat } from '../../types/database'
import { formatDate } from '../../utils'
import { formatNumber } from '../../utils'
import { showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { CardSkeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { IconButton } from '../../components/buttons/Button'
import { StatCell } from '../../components/StatCell'

type SellerPaymentsRouteProp = RouteProp<Record<string, { sellerId: number }>, string>

function PaymentStatsSection({ stat }: { stat: ISellerPaymentStat }) {
    const styles = useStyles()
    const { UI_TEXT, CURRENCY } = useLocalizedConstants()
    return (
        <View style={styles.sellerStatsRow}>
            <StatCell label={UI_TEXT.OWED} value={`${formatNumber(stat.total_owed)}${CURRENCY}`} icon="cart-outline" />
            <View style={styles.sellerStatDivider} />
            <StatCell label={UI_TEXT.PAID} value={`${formatNumber(stat.total_paid)}${CURRENCY}`} icon="checkmark-circle-outline" />
            <View style={styles.sellerStatDivider} />
            <StatCell label={UI_TEXT.BALANCE} value={`${formatNumber(stat.balance)}${CURRENCY}`} icon="wallet-outline" />
        </View>
    )
}

function PaymentRow({ item, onDelete }: { item: IPayment; onDelete: () => void }) {
    const styles = useStyles()
    const { theme } = useTheme()
    const { t } = useTranslation()
    const { A11Y_LABELS, CURRENCY } = useLocalizedConstants()
    return (
        <View style={styles.purchaseItemRow}>
            <View style={styles.sellerInfo}>
                <RNText style={styles.purchaseItemTitle}>{formatNumber(item.amount)}{CURRENCY}</RNText>
                <RNText style={styles.purchaseItemSubtitle}>
                    {formatDate(item.paid_at)}
                    {item.method ? ` · ${t(`paymentMethods.${item.method}`, { defaultValue: item.method })}` : ''}
                    {item.note ? ` · ${item.note}` : ''}
                </RNText>
            </View>
            <IconButton
                icon={<Ionicons name="trash-outline" size={18} color={theme.colors.error} />}
                variant="ghost"
                onPress={onDelete}
                accessibilityLabel={A11Y_LABELS.DELETE_PAYMENT}
            />
        </View>
    )
}

export default function SellerPayments() {
    const styles = useStyles()
    const { theme } = useTheme()
    const { t } = useTranslation()
    const { UI_TEXT, MESSAGES, A11Y_LABELS } = useLocalizedConstants()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const route = useRoute<SellerPaymentsRouteProp>()
    const sellerId = route.params?.sellerId

    const [paymentStat, setPaymentStat] = useState<ISellerPaymentStat | null>(null)
    const [payments, setPayments] = useState<IPayment[]>([])
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const { loading, withLoading } = useLoading(false)
    // Keyset cursor (id of the last loaded row); undefined = first page.
    const cursorRef = useRef<number | undefined>(undefined)

    const loadPayments = useCallback(
        async (reset = true) => {
            if (sellerId === undefined || sellerId === null) {
                return
            }
            const cursor = reset ? undefined : cursorRef.current
            const loader = reset
                ? withLoading
                : async (fn: () => Promise<void>) => {
                    setLoadingMore(true)
                    try {
                        await fn()
                    } finally {
                        setLoadingMore(false)
                    }
                }
            await loader(async () => {
                try {
                    if (reset) {
                        const stat = await paymentService.getSellerPaymentStat(sellerId).catch(() => null)
                        setPaymentStat(stat)
                    }
                    const { items, nextCursor } = await paymentService.getPaymentsPageBySeller({
                        sellerId,
                        limit: PAGINATION_CONFIG.PURCHASE_PAGE_SIZE,
                        cursor,
                    })
                    setPayments((prev) => (reset ? items : [...prev, ...items]))
                    cursorRef.current = nextCursor ?? undefined
                    setHasMore(nextCursor !== null)
                } catch (error) {
                    showError((error as Error)?.message ?? t('messages.ERROR_GENERIC'))
                }
            })
        },
        [sellerId, withLoading, t],
    )

    const handleRefresh = useCallback(() => {
        loadPayments(true)
    }, [loadPayments])

    const handleLoadMore = useCallback(() => {
        if (!loading && !loadingMore && hasMore) {
            loadPayments(false)
        }
    }, [loading, loadingMore, hasMore, loadPayments])

    const confirmDeletePayment = useConfirmDelete<[number]>({
        remove: (id) => paymentService.removePayment(id),
        confirmMessage: UI_TEXT.DELETE_PAYMENT_CONFIRM_MESSAGE,
        successMessage: MESSAGES.PAYMENT_DELETE_SUCCESS,
        onDeleted: handleRefresh,
    })

    React.useEffect(() => {
        loadPayments(true)
    }, [loadPayments])

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={[styles.priceListContainer, styles.fillContainer]}>
                <View style={styles.sellerDetailsBackRow}>
                    <IconButton
                        icon={<Ionicons name="arrow-back" size={22} color={theme.colors.primary} />}
                        variant="ghost"
                        onPress={() => navigation.goBack()}
                        accessibilityLabel={A11Y_LABELS.GO_BACK}
                    />
                    <RNText style={styles.sellerDetailsBackTitle}>{UI_TEXT.PAYMENT_HISTORY}</RNText>
                </View>

                {loading && payments.length === 0 && !paymentStat ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    <FlatList
                        style={styles.recentPurchasesList}
                        data={payments}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <PaymentRow item={item} onDelete={() => confirmDeletePayment(item.id)} />
                        )}
                        ListHeaderComponent={paymentStat ? <PaymentStatsSection stat={paymentStat} /> : null}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={loadingMore ? (
                            <>
                                <CardSkeleton />
                                <CardSkeleton />
                            </>
                        ) : null}
                        refreshControl={
                            <RefreshControl
                                refreshing={loading}
                                onRefresh={handleRefresh}
                                colors={[theme.colors.primary]}
                            />
                        }
                        ListEmptyComponent={
                            loading ? null : (
                                <EmptyState
                                    icon="cash-outline"
                                    title={UI_TEXT.EMPTY_PAYMENT_LIST}
                                    description={UI_TEXT.PAYMENT_SETTLE_HINT}
                                />
                            )
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    )
}
