import { RefreshControl, View, FlatList } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import PriceCard from './PriceCard'
import ActionButtons from './ActionButtons'
import { usePrices } from '../../context/PriceContext'
import EditPrice from './EditPrice'
import { SAFE_AREA, UI_TEXT, MESSAGES, SORT_MODES, SortMode } from '../../constants'
import { IPrice } from '../../types/database'
import { SearchBar } from '../../components/SearchBar'
import { PriceTrend } from '../../components/PriceTrend'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { CardSkeleton } from '../../components/Skeleton'
import { PriceDetailSheet } from '../../components/PriceDetailSheet'
import { useSearchFilter } from '../../hooks/useSearchFilter'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'

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
    onEdit,
    onDelete,
    onRefresh,
}: {
    prices: IPrice[]
    loading: boolean
    hasQuery: boolean
    searchQuery: string
    onEdit: (price: IPrice) => void
    onDelete: (id: number) => void
    onRefresh: () => void
}) {
    const styles = useStyles()
    const { theme } = useTheme()
    return (
        <FlatList
            data={prices}
            keyExtractor={(item) => item.id.toString()}
            refreshing={loading}
            initialScrollIndex={0}
            renderItem={({ item }) => (
                <PriceCard
                    {...item}
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item.id)}
                />
            )}
            ListEmptyComponent={
                <EmptyState
                    icon={hasQuery ? 'search-outline' : 'pricetag-outline'}
                    title={hasQuery ? UI_TEXT.NO_MATCHING_RESULTS : MESSAGES.EMPTY_PRICE_LIST}
                    description={hasQuery ? `No prices matching "${searchQuery}"` : UI_TEXT.PLUM_COUNT_TITLE}
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
                    description={`${UI_TEXT.PRICE_DESCRIPTION} • ${visiblePrices.length} ${visiblePrices.length === 1 ? 'price' : 'prices'}`}
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
                        onEdit={setEditing}
                        onDelete={confirmDelete}
                        onRefresh={refresh}
                    />
                )}
                <EditPrice
                    visible={!!editing}
                    price={editing}
                    onClose={() => setEditing(null)}
                />
                <PriceDetailSheet visible={!!detailPrice} price={detailPrice} onClose={() => setDetailPrice(null)} />
            </View>
        </SafeAreaView>
    )
}
