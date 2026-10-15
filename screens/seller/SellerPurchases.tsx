import { FlatList, RefreshControl, Text as RNText, View } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ParamListBase } from '@react-navigation/native'
import { useTheme } from '@rneui/themed'
import { useStyles } from '../../styles'
import { PAGINATION_CONFIG, SAFE_AREA } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { sellerService } from '../../services/sellerService'
import { purchaseService } from '../../services/purchaseService'
import { IPurchaseDetail } from '../../types/database'
import { formatNumber } from '../../utils'
import { getErrorMessage } from '../../utils/errors'
import { showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { CardSkeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { MoneyText } from '../../components/MoneyText'
import { SellerScreenHeader } from './SellerScreenHeader'
import { SellerPurchaseRow } from './SellerPurchaseRow'
import { LoadError } from '../../components/LoadError'

type SellerPurchasesRouteProp = RouteProp<Record<string, { sellerId: number }>, string>

export default function SellerPurchases() {
    const styles = useStyles()
    const { theme } = useTheme()
    const { UI_TEXT } = useLocalizedConstants()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const route = useRoute<SellerPurchasesRouteProp>()
    const sellerId = route.params?.sellerId

    const [purchases, setPurchases] = useState<IPurchaseDetail[]>([])
    const [sellerStats, setSellerStats] = useState<{ count: number; total: number } | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    // Set when the first page fails; replaces the list with a retry state so a
    // failed fetch never reads as "no purchases".
    const [loadError, setLoadError] = useState<unknown>(null)
    const { loading, withLoading } = useLoading(true)
    // Keyset cursor (id of the last loaded row); undefined = first page.
    const cursorRef = useRef<number | undefined>(undefined)

    // Header totals are independent of the loaded pages, so they stay correct
    // as the list paginates. Scoped to this seller only.
    const loadStats = useCallback(async () => {
        if (sellerId === undefined || sellerId === null) {
            return
        }
        try {
            const stat = await sellerService.getSellerStatById(sellerId)
            setSellerStats(stat ? { count: stat.purchase_count, total: stat.total_owed } : { count: 0, total: 0 })
        } catch (error) {
            showError(getErrorMessage(error))
        }
    }, [sellerId])

    const loadPurchases = useCallback(
        async (reset = true) => {
            if (sellerId === undefined || sellerId === null) {
                return
            }
            if (reset) {
                setLoadError(null)
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
                    if (reset) {
                        setLoadError(error)
                    }
                    showError(getErrorMessage(error))
                }
            })
        },
        [sellerId, withLoading],
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

    const renderItem = useCallback(({ item }: { item: IPurchaseDetail }) => {
        return <SellerPurchaseRow variant="list" item={item} />
    }, [])

    React.useEffect(() => {
        handleRefresh()
    }, [handleRefresh])

    const total = sellerStats?.total ?? 0

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={[styles.priceListContainer, styles.fillContainer]}>
                <SellerScreenHeader
                    title={UI_TEXT.PURCHASE_HISTORY_TITLE}
                    onBack={() => navigation.goBack()}
                />

                <View style={styles.recentPurchasesHeader}>
                    <RNText style={styles.recentPurchasesTitle}>{UI_TEXT.RECENT_PURCHASES}</RNText>
                    <RNText style={styles.recentPurchasesCount}>
                        {sellerStats && sellerStats.count > 0 ? (
                            <>{formatNumber(sellerStats.count, 0)} · <MoneyText amount={total} /></>
                        ) : null}
                    </RNText>
                </View>

                {loading && purchases.length === 0 && !loadError ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : loadError && purchases.length === 0 ? (
                    <LoadError error={loadError} onRetry={() => loadPurchases(true)} />
                ) : (
                    <FlatList
                        style={styles.recentPurchasesList}
                        contentContainerStyle={styles.scrollContentGutter}
                        data={purchases}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
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
