import { FlatList, RefreshControl, Text as RNText, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native'
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
import { getErrorMessage } from '../../utils/errors'
import { showError } from '../../utils/notifications'
import { useSearchFilter } from '../../hooks/useSearchFilter'
import { SearchIconButton } from '../../components/SearchIconButton'
import { SellerRow } from './SellerRow'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { Skeleton } from '../../components/Skeleton'
import { LoadError } from '../../components/LoadError'

function SellerHeader({ count }: { count: number }) {
    const { t } = useTranslation()
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <SectionHeader
            icon="people-outline"
            title={UI_TEXT.SELLERS}
            description={t('uiText.SELLERS_HEADER_DESCRIPTION', {
                description: UI_TEXT.SELLERS_DESCRIPTION,
                summary: t('uiText.SELLER_COUNT', { count }),
            })}
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
            <PrimaryButton compact title={UI_TEXT.ADD_SELLER} onPress={onAddSeller} testID="btn-Add Seller" />
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
    loadError,
    onRefresh,
    onEndReached,
    onRetry,
    onOpenDetail,
    onEdit,
}: {
    sellers: ISellerWithStats[]
    loading: boolean
    loadingMore: boolean
    hasQuery: boolean
    searchQuery: string
    loadError: unknown
    onRefresh: () => void
    onEndReached: () => void
    onRetry: () => void
    onOpenDetail: (seller: ISellerWithStats) => void
    onEdit: (seller: ISellerWithStats) => void
}) {
    const styles = useStyles()
    const { theme } = useTheme()
    const { t } = useTranslation()
    const { UI_TEXT } = useLocalizedConstants()

    // Stable row element: SellerRow is memoized on (seller + stable callbacks),
    // so rows do not re-render when the list parent does.
    const renderItem = useCallback(({ item }: { item: ISellerWithStats }) => (
        <SellerRow
            seller={item}
            purchaseCount={item.purchase_count}
            purchaseTotal={item.total_spent}
            balance={item.balance}
            onPress={onOpenDetail}
            onEdit={onEdit}
        />
    ), [onOpenDetail, onEdit])

    if (loading && sellers.length === 0 && !loadError) {
        return <SellerListSkeleton />
    }

    if (loadError && sellers.length === 0) {
        return <LoadError error={loadError} onRetry={onRetry} />
    }

    return (
        <FlatList
            data={sellers}
            contentContainerStyle={styles.scrollContentGutter}
            keyExtractor={(item) => item.id.toString()}
            initialNumToRender={10}
            windowSize={10}
            removeClippedSubviews={true}
            renderItem={renderItem}
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
    // Start loading so the empty state never flashes before the first page.
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    // Set when a full reload fails; the list shows a retry state instead of
    // the "no sellers yet" empty state.
    const [loadError, setLoadError] = useState<unknown>(null)
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
            if (reset) {
                setLoading(true)
                setLoadError(null)
            } else setLoadingMore(true)
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
                if (reset) {
                    setLoadError(error)
                }
                showError(getErrorMessage(error))
            } finally {
                if (mountedRef.current && token === requestTokenRef.current) {
                    if (reset) setLoading(false)
                    else setLoadingMore(false)
                }
            }
        },
        [searchQuery],
    )

    useEffect(() => {
        loadSellers(true, '')
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Balances and purchase totals change in other tabs (recorded purchases
    // and payments), so refetch whenever this screen regains focus. The first
    // focus happens on mount, which the initial load above already covers.
    const hasFocusedRef = useRef(false)
    useFocusEffect(
        useCallback(() => {
            if (!hasFocusedRef.current) {
                hasFocusedRef.current = true
                return
            }
            loadSellers(true)
        }, [loadSellers])
    )

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

    const handleEdit = useCallback((seller: ISellerWithStats) => {
        setEditing(seller)
        setSheetVisible(true)
    }, [])

    const handleAddSeller = useCallback(() => {
        setEditing(null)
        setSheetVisible(true)
    }, [])

    const handleRetry = useCallback(() => {
        loadSellers(true, searchQuery)
    }, [loadSellers, searchQuery])

    const isInitialLoading = loading && sellers.length === 0

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={styles.priceListContainer}>
                <SellerHeader count={totalCount} />
                <SellerActions
                    searchVisible={searchVisible}
                    onAddSeller={handleAddSeller}
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
                    loadError={loadError}
                    onRefresh={handleRefresh}
                    onEndReached={handleLoadMore}
                    onRetry={handleRetry}
                    onOpenDetail={handleOpenDetail}
                    onEdit={handleEdit}
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
