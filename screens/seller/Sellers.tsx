import { FlatList, RefreshControl, Text as RNText, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { useTranslation } from 'react-i18next'
import { PrimaryButton } from '../../components/buttons/Button'
import { PAGINATION_CONFIG, ROUTES, SAFE_AREA } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { sellerService, type SellersCursor } from '../../services/sellerService'
import { ISellerWithStats } from '../../types/database'
import SellerFormSheet from './SellerFormSheet'
import { SearchBar } from '../../components/SearchBar'
import { showError } from '../../utils/notifications'
import { formatNumber } from '../../utils'
import { useSearchFilter } from '../../hooks/useSearchFilter'
import { SearchIconButton } from '../../components/SearchIconButton'
import { SellerRow } from './SellerRow'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { Skeleton } from '../../components/Skeleton'

function SellerHeader({ count }: { count: number }) {
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <SectionHeader
            icon="people-outline"
            title={UI_TEXT.SELLERS}
            description={`${UI_TEXT.SELLERS_DESCRIPTION} • ${formatNumber(count, 0)} ${count === 1 ? UI_TEXT.SELLER_SINGULAR : UI_TEXT.SELLER_PLURAL}`}
        />
    )
}

function SellerActions({
    searchVisible,
    onAddSeller,
    onToggleSearch,
}: {
    searchVisible: boolean
    onAddSeller: () => void
    onToggleSearch: () => void
}) {
    const styles = useStyles()
    const { UI_TEXT, A11Y_LABELS } = useLocalizedConstants()

    return (
        <View style={styles.sellerActionsRow}>
            <PrimaryButton compact title={UI_TEXT.ADD_SELLER} onPress={onAddSeller} />
            <SearchIconButton
                active={searchVisible}
                onPress={onToggleSearch}
                accessibilityLabel={A11Y_LABELS.TOGGLE_SEARCH}
            />
        </View>
    )
}

function SellerSearch({
    visible,
    query,
    onChangeText,
}: {
    visible: boolean
    query: string
    onChangeText: (query: string) => void
}) {
    const { UI_TEXT } = useLocalizedConstants()
    if (!visible) {
        return null
    }

    return (
        <SearchBar
            placeholder={UI_TEXT.SEARCH_SELLERS_PLACEHOLDER}
            value={query}
            onChangeText={onChangeText}
        />
    )
}

function SellerListSkeleton() {
    const styles = useStyles()

    return (
        <>
            {[0, 1, 2, 3].map((key) => (
                <View key={key} style={styles.purchaseItemRow}>
                    <Skeleton width={44} height={44} radius={22} />
                    <View style={styles.sellerProfileSkeletonText}>
                        <Skeleton width="62%" height={15} />
                        <Skeleton width="42%" height={12} />
                    </View>
                    <Skeleton width={36} height={36} radius={10} />
                </View>
            ))}
        </>
    )
}

function SellerListFooter() {
    const styles = useStyles()

    return (
        <>
            {[0, 1].map((key) => (
                <View key={key} style={styles.purchaseItemRow}>
                    <Skeleton width={44} height={44} radius={22} />
                    <View style={styles.sellerProfileSkeletonText}>
                        <Skeleton width="62%" height={15} />
                        <Skeleton width="42%" height={12} />
                    </View>
                    <Skeleton width={36} height={36} radius={10} />
                </View>
            ))}
        </>
    )
}

function SellerList({
    sellers,
    loading,
    loadingMore,
    hasQuery,
    searchQuery,
    onRefresh,
    onEndReached,
    onOpenDetail,
    onEdit,
}: {
    sellers: ISellerWithStats[]
    loading: boolean
    loadingMore: boolean
    hasQuery: boolean
    searchQuery: string
    onRefresh: () => void
    onEndReached: () => void
    onOpenDetail: (seller: ISellerWithStats) => void
    onEdit: (seller: ISellerWithStats) => void
}) {
    const { theme } = useTheme()
    const { t } = useTranslation()
    const { UI_TEXT } = useLocalizedConstants()

    if (loading && sellers.length === 0) {
        return <SellerListSkeleton />
    }

    return (
        <FlatList
            data={sellers}
            keyExtractor={(item) => item.id.toString()}
            initialNumToRender={10}
            windowSize={10}
            removeClippedSubviews={true}
            renderItem={({ item }) => (
                <SellerRow
                    seller={item}
                    purchaseCount={item.purchase_count}
                    purchaseTotal={item.total_spent}
                    balance={item.balance}
                    onPress={() => onOpenDetail(item)}
                    onEdit={() => onEdit(item)}
                />
            )}
            ListEmptyComponent={
                <EmptyState
                    icon={hasQuery ? 'search-outline' : 'people-outline'}
                    title={hasQuery ? UI_TEXT.NO_MATCHING_RESULTS : UI_TEXT.EMPTY_SELLER_LIST}
                    description={hasQuery ? t('uiText.NO_SELLERS_MATCHING', { query: searchQuery }) : UI_TEXT.ADD_FIRST_SELLER_HINT}
                />
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loadingMore ? <SellerListFooter /> : null}
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={onRefresh}
                    colors={[theme.colors.primary]}
                />
            }
        />
    )
}

function SellerForm({
    visible,
    seller,
    onClose,
    onSaved,
}: {
    visible: boolean
    seller: ISellerWithStats | null
    onClose: () => void
    onSaved: () => void
}) {
    return (
        <SellerFormSheet
            visible={visible}
            seller={seller}
            onClose={onClose}
            onSaved={onSaved}
        />
    )
}

export default function Sellers() {
    const styles = useStyles()
    const { t } = useTranslation()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const [sellers, setSellers] = useState<ISellerWithStats[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [sheetVisible, setSheetVisible] = useState(false)
    const [editing, setEditing] = useState<ISellerWithStats | null>(null)
    // Keyset cursor (last row's name + id); undefined = first page.
    const cursorRef = useRef<SellersCursor | undefined>(undefined)
    // Monotonic token: only the latest load may commit (search/refresh/load-more).
    const requestTokenRef = useRef(0)
    const mountedRef = useRef(true)
    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])
    // Search is server-side (paginated queries); the hook only supplies the
    // visibility/query/toggle state, so no predicate.
    const {
        visible: searchVisible,
        query: searchQuery,
        setQuery: setSearchQuery,
        toggle: handleToggleSearch,
        hasQuery,
    } = useSearchFilter(sellers)

    const loadSellers = useCallback(
        async (reset = true, queryOverride?: string) => {
            const query = queryOverride !== undefined ? queryOverride : searchQuery
            const trimmed = query.trim() || undefined
            const cursor = reset ? undefined : cursorRef.current
            const token = ++requestTokenRef.current
            if (reset) setLoading(true)
            else setLoadingMore(true)
            try {
                const [page, count] = await Promise.all([
                    sellerService.getSellersPage({
                        limit: PAGINATION_CONFIG.SELLER_PAGE_SIZE,
                        cursor,
                        query: trimmed,
                    }),
                    reset ? sellerService.getSellerCount(trimmed) : Promise.resolve(null),
                ])
                if (!mountedRef.current || token !== requestTokenRef.current) return
                const { items, nextCursor } = page
                if (reset) {
                    setSellers(items)
                    if (count !== null) setTotalCount(count)
                } else {
                    setSellers(prev => [...prev, ...items])
                }
                cursorRef.current = nextCursor ?? undefined
                setHasMore(nextCursor !== null)
            } catch (error) {
                if (!mountedRef.current || token !== requestTokenRef.current) return
                showError((error as Error)?.message ?? t('messages.ERROR_GENERIC'))
            } finally {
                if (mountedRef.current && token === requestTokenRef.current) {
                    if (reset) setLoading(false)
                    else setLoadingMore(false)
                }
            }
        },
        [searchQuery, t],
    )

    useEffect(() => {
        loadSellers(true, '')
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Reload on search changes, but skip the mount-time run (initial load above)
    const searchEffectReady = useRef(false)
    useEffect(() => {
        if (!searchEffectReady.current) {
            searchEffectReady.current = true
            return
        }
        if (searchVisible) {
            loadSellers(true, searchQuery)
        } else if (searchQuery === '') {
            loadSellers(true, '')
        }
    }, [searchQuery, searchVisible]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleLoadMore = useCallback(() => {
        if (!loading && !loadingMore && hasMore) {
            loadSellers(false, searchQuery)
        }
    }, [loading, loadingMore, hasMore, searchQuery, loadSellers])

    const handleRefresh = useCallback(() => {
        loadSellers(true, searchQuery)
    }, [loadSellers, searchQuery])

    const handleOpenDetail = useCallback((seller: ISellerWithStats) => {
        navigation.navigate(ROUTES.SELLER_DETAILS, { sellerId: seller.id })
    }, [navigation])

    const isInitialLoading = loading && sellers.length === 0

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={styles.priceListContainer}>
                <SellerHeader count={totalCount} />
                <SellerActions
                    searchVisible={searchVisible}
                    onAddSeller={() => {
                        setEditing(null)
                        setSheetVisible(true)
                    }}
                    onToggleSearch={handleToggleSearch}
                />
                <SellerSearch
                    visible={searchVisible}
                    query={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {hasQuery && !isInitialLoading ? (
                    <RNText style={styles.purchaseResultsCount}>
                        {t('uiText.SHOWING_COUNT', {
                            filtered: sellers.length,
                            total: totalCount,
                        })}
                    </RNText>
                ) : null}
                <SellerList
                    sellers={sellers}
                    loading={loading}
                    loadingMore={loadingMore}
                    hasQuery={hasQuery}
                    searchQuery={searchQuery}
                    onRefresh={handleRefresh}
                    onEndReached={handleLoadMore}
                    onOpenDetail={handleOpenDetail}
                    onEdit={(seller) => {
                        setEditing(seller)
                        setSheetVisible(true)
                    }}
                />
            </View>

            <SellerForm
                visible={sheetVisible}
                seller={editing}
                onClose={() => {
                    setSheetVisible(false)
                    setEditing(null)
                }}
                onSaved={() => loadSellers(true, searchQuery)}
            />
        </SafeAreaView>
    )
}
