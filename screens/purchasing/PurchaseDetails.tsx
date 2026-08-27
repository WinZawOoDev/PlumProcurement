import { FlatList, RefreshControl, Share, Text as RNText, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@rneui/base'
import { useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { UI_TEXT, MESSAGES, SAFE_AREA, DIMENSIONS } from '../../constants'
import { purchaseService } from '../../services/purchaseService'
import { IPurchaseWithSeller } from '../../database'
import { buildPurchasesCsvWithBom, formatDate, getCsvFilename } from '../../utils'
import { IconButton, SecondaryButton } from '../../components/buttons/Button'
import { SearchBar } from '../../components/SearchBar'
import { showError, showSuccess } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { PAGINATION_CONFIG } from '../../constants'

export default function PurchaseDetails() {
    const styles = useStyles()
    const { theme } = useTheme()
    const [purchases, setPurchases] = useState<IPurchaseWithSeller[]>([])
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const { loading, withLoading } = useLoading(false)
    const [searchVisible, setSearchVisible] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const loadPurchases = useCallback(
        async (reset = true, queryOverride?: string) => {
            const query = queryOverride !== undefined ? queryOverride : searchQuery
            const targetPage = reset ? 0 : page
            const loader = reset ? withLoading : async (fn: () => Promise<void>) => {
                setLoadingMore(true)
                try {
                    await fn()
                } finally {
                    setLoadingMore(false)
                }
            }
            await loader(async () => {
                try {
                    const { items, hasMore: more } = await purchaseService.getPurchasesPaginated(
                        targetPage,
                        PAGINATION_CONFIG.PURCHASE_PAGE_SIZE,
                        query.trim() || undefined
                    )
                    if (reset) {
                        setPurchases(items)
                        setPage(1)
                    } else {
                        setPurchases((prev) => [...prev, ...items])
                        setPage((p) => p + 1)
                    }
                    setHasMore(more)
                } catch (error) {
                    showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC)
                }
            })
        },
        [withLoading, page, searchQuery]
    )

    useEffect(() => {
        loadPurchases(true, '')
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (searchVisible) {
            loadPurchases(true, searchQuery)
        } else if (searchQuery === '') {
            // when search closed, reload without filter
            loadPurchases(true, '')
        }
    }, [searchQuery, searchVisible]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleLoadMore = useCallback(() => {
        if (!loading && !loadingMore && hasMore) {
            loadPurchases(false, searchQuery)
        }
    }, [loading, loadingMore, hasMore, searchQuery, loadPurchases])

    const handleRefresh = useCallback(() => {
        loadPurchases(true, searchQuery)
    }, [loadPurchases, searchQuery])

    const visiblePurchases = purchases

    const grandTotal = visiblePurchases.reduce((sum, p) => sum + p.total, 0)

    const csv = useMemo(() => buildPurchasesCsvWithBom(visiblePurchases), [visiblePurchases])

    const handleToggleSearch = () => {
        setSearchVisible((prev) => {
            if (prev) setSearchQuery('')
            return !prev
        })
    }

    const handleExport = async () => {
        if (visiblePurchases.length === 0) {
            showError(UI_TEXT.EMPTY_PURCHASE_LIST)
            return
        }
        try {
            const filename = getCsvFilename()
            await Share.share({
                message: csv,
                title: `${UI_TEXT.EXPORT_CSV}: ${filename}`,
            })
            showSuccess(`${UI_TEXT.EXPORT_CSV} — ${visiblePurchases.length} rows`)
        } catch {
            showError(MESSAGES.ERROR_GENERIC)
        }
    }

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={styles.priceListContainer}>
                <View style={styles.titleDescription}>
                    <Text style={styles.titleText}>{UI_TEXT.PURCHASE_HISTORY_TITLE}</Text>
                    <Text style={styles.descriptionText}>{UI_TEXT.PURCHASE_HISTORY_DESCRIPTION}</Text>
                </View>

                <View style={styles.purchaseSummaryCard}>
                    <View style={styles.purchaseSummaryRow}>
                        <RNText style={styles.purchaseSummaryLabel}>{UI_TEXT.PURCHASES_COUNT}</RNText>
                        <RNText style={styles.purchaseSummaryValue}>{visiblePurchases.length}</RNText>
                    </View>
                    <View style={styles.purchaseSummaryRow}>
                        <RNText style={styles.purchaseSummaryLabel}>{UI_TEXT.TOTAL_VALUE}</RNText>
                        <RNText style={styles.purchaseTotalText}>{grandTotal.toFixed(2)}$</RNText>
                    </View>
                </View>

                <View style={styles.actionButtonsRow}>
                    <SecondaryButton
                        title={UI_TEXT.EXPORT_CSV}
                        disabled={purchases.length === 0}
                        onPress={handleExport}
                        containerStyle={styles.exportButtonContainer}
                    />
                    <IconButton
                        icon={
                            <Ionicons
                                name={searchVisible ? 'search' : 'search-outline'}
                                size={DIMENSIONS.ICON_SIZE_LARGE}
                                color={searchVisible ? theme.colors.primary : theme.colors.tertiary}
                            />
                        }
                        variant="secondary"
                        onPress={handleToggleSearch}
                    />
                </View>

                {searchVisible && (
                    <SearchBar
                        placeholder={UI_TEXT.SEARCH_PURCHASES_PLACEHOLDER}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                )}

                <FlatList
                    data={visiblePurchases}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.purchaseItemRow}>
                            <View style={styles.sellerInfo}>
                                <RNText style={styles.purchaseItemTitle}>
                                    {item.category} ({item.unit})
                                </RNText>
                                <RNText style={styles.purchaseItemSubtitle}>
                                    {formatDate(item.created_at)}
                                    {item.seller_name ? ` · ${UI_TEXT.SOLD_BY}: ${item.seller_name}` : ''}
                                </RNText>
                                <RNText style={styles.purchaseItemSubtitle}>
                                    {item.quantity} × {item.unit_price.toFixed(2)}$
                                </RNText>
                            </View>
                            <RNText style={styles.purchaseItemTotal}>{item.total.toFixed(2)}$</RNText>
                        </View>
                    )}
                    ListEmptyComponent={
                        <RNText style={styles.emptyPriceListText}>
                            {purchases.length > 0 ? UI_TEXT.NO_MATCHING_RESULTS : UI_TEXT.EMPTY_PURCHASE_LIST}
                        </RNText>
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? <RNText style={styles.emptyPriceListText}>{MESSAGES.LOADING}</RNText> : null
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={handleRefresh}
                            colors={[theme.colors.primary]}
                        />
                    }
                />
            </View>

        </SafeAreaView>
    )
}
