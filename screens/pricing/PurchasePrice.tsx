import { RefreshControl, SectionList, Text as RNText, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import PriceCard from './PriceCard'
import ActionButtons from './ActionButtons'
import { usePrices } from '../../context/PriceContext'
import EditPrice from './EditPrice'
import { SAFE_AREA, SORT_MODES, SortMode, CATEGORY_LIST } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { IPrice } from '../../types/database'
import { SearchBar } from '../../components/SearchBar'
import { PriceTrend } from '../../components/PriceTrend'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { CardSkeleton } from '../../components/Skeleton'
import { PriceDetailSheet } from '../../components/PriceDetailSheet'
import { useSearchFilter } from '../../hooks/useSearchFilter'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'

interface PriceSection {
    category: string
    data: IPrice[]
}

function groupByCategory(prices: IPrice[]): PriceSection[] {
    const order = new Map<string, number>()
    CATEGORY_LIST.forEach((c, i) => order.set(c.value, i))
    const sections = new Map<string, IPrice[]>()
    for (const price of prices) {
        const key = price.category
        if (!order.has(key)) order.set(key, order.size)
        if (!sections.has(key)) sections.set(key, [])
        sections.get(key)!.push(price)
    }
    return [...sections.entries()]
        .sort((a, b) => (order.get(a[0]) ?? Infinity) - (order.get(b[0]) ?? Infinity))
        .map(([category, data]) => ({ category, data }))
}

function PriceListSkeleton() {
    return (
        <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
        </>
    )
}

function PriceList({
    prices,
    loading,
    hasQuery,
    searchQuery,
    onSelect,
    onRefresh,
}: {
    prices: IPrice[]
    loading: boolean
    hasQuery: boolean
    searchQuery: string
    onSelect: (price: IPrice) => void
    onRefresh: () => void
}) {
    const styles = useStyles()
    const { theme } = useTheme()
    const { t } = useTranslation()
    const { UI_TEXT, MESSAGES } = useLocalizedConstants()
    const sections = React.useMemo(() => groupByCategory(prices), [prices])
    return (
        <SectionList
            sections={sections}
            keyExtractor={(item) => item.id.toString()}
            refreshing={loading}
            stickySectionHeadersEnabled
            renderItem={({ item }) => (
                <PriceCard
                    {...item}
                    onPress={() => onSelect(item)}
                />
            )}
            renderSectionHeader={({ section }) => (
                <View style={[styles.priceListSectionHeader, styles.priceListSectionHeaderSticky]}>
                    <RNText style={styles.priceListSectionTitle} numberOfLines={1}>
                        {t(`categories.${section.category}`, { defaultValue: section.category })}
                    </RNText>
                    <RNText style={styles.priceListSectionCount}>{section.data.length}</RNText>
                </View>
            )}
            ListEmptyComponent={
                <EmptyState
                    icon={hasQuery ? 'search-outline' : 'pricetag-outline'}
                    title={hasQuery ? UI_TEXT.NO_MATCHING_RESULTS : MESSAGES.EMPTY_PRICE_LIST}
                    description={hasQuery ? t('uiText.NO_PRICES_MATCHING', { query: searchQuery }) : UI_TEXT.PLUM_COUNT_TITLE}
                />
            }
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={onRefresh}
                    colors={[theme.colors.primary]}
                />
            }
            style={styles.priceListFlatList}
        />
    )
}

export default function PurchasePrices() {
    const styles = useStyles()
    const { UI_TEXT, MESSAGES } = useLocalizedConstants()
    const { prices, loading, refresh, removePrice } = usePrices()
    const [editing, setEditing] = useState<IPrice | null>(null)
    const [detailPrice, setDetailPrice] = useState<IPrice | null>(null)
    const [sortMode, setSortMode] = useState<SortMode>('default')
    const {
        visible: searchVisible,
        query: searchQuery,
        setQuery: setSearchQuery,
        toggle: handleToggleSearch,
        filtered: matchedPrices,
        hasQuery,
    } = useSearchFilter(
        prices,
        useCallback(
            (p: IPrice, q: string) =>
                p.category.toLowerCase().includes(q) || p.unit.toLowerCase().includes(q),
            []
        )
    )

    useEffect(() => {
        refresh()
    }, [refresh])

    const visiblePrices = (() => {
        if (sortMode === 'price_asc') {
            return [...matchedPrices].sort((a, b) => a.price - b.price)
        }
        if (sortMode === 'price_desc') {
            return [...matchedPrices].sort((a, b) => b.price - a.price)
        }
        return matchedPrices
    })()

    const handleSortPress = () => {
        const nextIndex = (SORT_MODES.indexOf(sortMode) + 1) % SORT_MODES.length
        setSortMode(SORT_MODES[nextIndex])
    }

    const confirmDelete = useConfirmDelete<[number]>({
        remove: (id) => removePrice(id),
        confirmMessage: UI_TEXT.DELETE_PRICE_CONFIRM_MESSAGE,
        successMessage: MESSAGES.PRICE_DELETE_SUCCESS,
    })

    return (
        <SafeAreaView
            edges={SAFE_AREA.EDGES}
            style={styles.priceListScreen}
        >
            <View style={styles.priceListContainer}>
                <SectionHeader
                    icon="pricetags-outline"
                    title={UI_TEXT.PRICE_MANAGEMENT}
                    description={`${UI_TEXT.PRICE_DESCRIPTION} • ${visiblePrices.length} ${visiblePrices.length === 1 ? UI_TEXT.PRICE_SINGULAR : UI_TEXT.PRICE_PLURAL}`}
                />
                <ActionButtons
                    searchActive={searchVisible}
                    onSearchPress={handleToggleSearch}
                    sortActive={sortMode !== 'default'}
                    sortDirection={sortMode === 'price_asc' ? 'asc' : 'desc'}
                    onSortPress={handleSortPress}
                />
                {searchVisible && (
                    <SearchBar
                        placeholder={UI_TEXT.SEARCH_PRICES_PLACEHOLDER}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                )}
                {visiblePrices.length > 1 && <PriceTrend prices={visiblePrices} onSelect={setDetailPrice} />}
                {loading && prices.length === 0 ? (
                    <PriceListSkeleton />
                ) : (
                    <PriceList
                        prices={visiblePrices}
                        loading={loading}
                        hasQuery={hasQuery}
                        searchQuery={searchQuery}
                        onSelect={setDetailPrice}
                        onRefresh={refresh}
                    />
                )}
                <EditPrice
                    visible={!!editing}
                    price={editing}
                    onClose={() => setEditing(null)}
                />
                <PriceDetailSheet
                    visible={!!detailPrice}
                    price={detailPrice}
                    onClose={() => setDetailPrice(null)}
                    onEdit={(price) => {
                        setDetailPrice(null)
                        setEditing(price)
                    }}
                    onDelete={(id) => {
                        setDetailPrice(null)
                        confirmDelete(id)
                    }}
                />
            </View>
        </SafeAreaView>
    )
}
