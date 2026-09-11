import { FlatList, Pressable, RefreshControl, Text as RNText, View } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from '@rneui/themed'
import { useTranslation } from 'react-i18next'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { PAGINATION_CONFIG, ROUTES, SAFE_AREA } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { purchaseService } from '../../services/purchaseService'
import { IPurchaseDetail } from '../../types/database'
import { formatDateDisplay, formatNumber } from '../../utils'
import { showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { CardSkeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { IconButton } from '../../components/buttons/Button'

type SellerPurchasesRouteProp = RouteProp<Record<string, { sellerId: number }>, string>

function SellerPurchasesRow({ item }: { item: IPurchaseDetail }) {
    const styles = useStyles()
    const { UI_TEXT, CURRENCY } = useLocalizedConstants()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    return (
        <Pressable
            style={styles.purchaseItemRow}
            onPress={() =>
                navigation.navigate(ROUTES.PURCHASE_SUMMARY, { purchase: item })
            }
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${UI_TEXT.PURCHASE_SUMMARY_TITLE}: ${item.seller_name ?? UI_TEXT.NO_SELLER}`}
        >
            <View style={styles.sellerInfo}>
                <RNText style={styles.purchaseItemTitle}>
                    {formatDateDisplay(item.created_at)}
                </RNText>
                <RNText style={styles.purchaseItemSubtitle}>
                    {formatNumber(item.items.length, 0)} {UI_TEXT.ITEMS.toLowerCase()}
                </RNText>
            </View>
            <View style={styles.purchaseItemActions}>
                <RNText style={styles.purchaseItemTotal}>{formatNumber(item.total)}{CURRENCY}</RNText>
            </View>
        </Pressable>
    )
}

export default function SellerPurchases() {
    const styles = useStyles()
    const { theme } = useTheme()
    const { t } = useTranslation()
    const { UI_TEXT, A11Y_LABELS, CURRENCY } = useLocalizedConstants()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const route = useRoute<SellerPurchasesRouteProp>()
    const sellerId = route.params?.sellerId

    const [purchases, setPurchases] = useState<IPurchaseDetail[]>([])
    const [sellerStats, setSellerStats] = useState<{ count: number; total: number } | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const { loading, withLoading } = useLoading(false)
    // Keyset cursor (id of the last loaded row); undefined = first page.
    const cursorRef = useRef<number | undefined>(undefined)

    // Header totals are independent of the loaded pages, so they stay correct
    // as the list paginates.
    const loadStats = useCallback(async () => {
        if (sellerId === undefined || sellerId === null) {
            return
        }
        try {
            const stats = await purchaseService.getSellerStats()
            const stat = stats.find((s) => s.seller_id === sellerId)
            setSellerStats(stat ? { count: stat.purchase_count, total: stat.total_spent } : { count: 0, total: 0 })
        } catch {
            // best-effort: the list still renders without the aggregate header
        }
    }, [sellerId])

    const loadPurchases = useCallback(
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
                    const { items, nextCursor } = await purchaseService.getPurchasesPage({
                        limit: PAGINATION_CONFIG.PURCHASE_PAGE_SIZE,
                        cursor,
                        sellerId,
                    })
                    setPurchases((prev) => (reset ? items : [...prev, ...items]))
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
        loadStats()
        loadPurchases(true)
    }, [loadStats, loadPurchases])

    const handleLoadMore = useCallback(() => {
        if (!loading && !loadingMore && hasMore) {
            loadPurchases(false)
        }
    }, [loading, loadingMore, hasMore, loadPurchases])

    React.useEffect(() => {
        handleRefresh()
    }, [handleRefresh])

    const total = sellerStats?.total ?? 0

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
                    <RNText style={styles.sellerDetailsBackTitle}>{UI_TEXT.PURCHASE_HISTORY_TITLE}</RNText>
                </View>

                <View style={styles.recentPurchasesHeader}>
                    <RNText style={styles.recentPurchasesTitle}>{UI_TEXT.RECENT_PURCHASES}</RNText>
                    <RNText style={styles.recentPurchasesCount}>
                        {sellerStats && sellerStats.count > 0 ? `${formatNumber(sellerStats.count, 0)} · ${formatNumber(total)}${CURRENCY}` : ''}
                    </RNText>
                </View>

                {loading && purchases.length === 0 ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    <FlatList
                        style={styles.recentPurchasesList}
                        data={purchases}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <SellerPurchasesRow item={item} />}
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
                                    icon="receipt-outline"
                                    title={UI_TEXT.EMPTY_PURCHASE_LIST}
                                    description={UI_TEXT.PURCHASE_HISTORY_DESCRIPTION}
                                />
                            )
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    )
}
