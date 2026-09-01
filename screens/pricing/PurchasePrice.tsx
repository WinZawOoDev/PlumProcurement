import { Alert, RefreshControl, View, FlatList } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import PriceCard from './PriceCard'
import ActionButtons from './ActionButtons'
import { usePrices } from '../../context/PriceContext'
import EditPrice from './EditPrice'
import { SAFE_AREA, UI_TEXT, MESSAGES, SORT_MODES, SortMode } from '../../constants'
import { DatabaseError } from '../../database/connection'
import { IPrice } from '../../types/database'
import { showSuccess, showError } from '../../utils/notifications'
import { SearchBar } from '../../components/SearchBar'
import { PriceTrend } from '../../components/PriceTrend'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { CardSkeleton } from '../../components/Skeleton'
import { PriceDetailSheet } from '../../components/PriceDetailSheet'

export default function PurchasePrices() {
    const styles = useStyles()
    const { theme } = useTheme()
    const { prices, loading, refresh, removePrice } = usePrices()
    const [editing, setEditing] = useState<IPrice | null>(null)
    const [detailPrice, setDetailPrice] = useState<IPrice | null>(null)
    const [searchVisible, setSearchVisible] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortMode, setSortMode] = useState<SortMode>('default')

    useEffect(() => {
        refresh()
    }, [refresh])

    const visiblePrices = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        let list = prices
        if (query) {
            list = list.filter(
                (p) =>
                    p.category.toLowerCase().includes(query) ||
                    p.unit.toLowerCase().includes(query)
            )
        }
        if (sortMode === 'price_asc') {
            list = [...list].sort((a, b) => a.price - b.price)
        } else if (sortMode === 'price_desc') {
            list = [...list].sort((a, b) => b.price - a.price)
        }
        return list
    }, [prices, searchQuery, sortMode])

    const handleSortPress = () => {
        const nextIndex = (SORT_MODES.indexOf(sortMode) + 1) % SORT_MODES.length
        setSortMode(SORT_MODES[nextIndex])
    }

    const handleToggleSearch = () => {
        setSearchVisible((prev) => {
            if (prev) setSearchQuery('')
            return !prev
        })
    }

    const handleDelete = (id: number) => {
        Alert.alert(
            UI_TEXT.DELETE_CONFIRM_TITLE,
            UI_TEXT.DELETE_PRICE_CONFIRM_MESSAGE,
            [
                { text: UI_TEXT.CANCEL, style: 'cancel' },
                {
                    text: UI_TEXT.DELETE,
                    style: 'destructive',
                    onPress: () => performDelete(id),
                },
            ]
        )
    }

    const performDelete = async (id: number) => {
        try {
            await removePrice(id)
            showSuccess(MESSAGES.PRICE_DELETE_SUCCESS)
        } catch (error) {
            const message = error instanceof DatabaseError ? error.message : MESSAGES.ERROR_GENERIC
            showError(message)
        }
    }

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
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    <FlatList
                        data={visiblePrices}
                        keyExtractor={(item) => item.id.toString()}
                        refreshing={loading}
                        initialScrollIndex={0}
                        renderItem={({ item }) => (
                            <PriceCard
                                {...item}
                                onEdit={() => setEditing(item)}
                                onDelete={() => handleDelete(item.id)}
                            />
                        )}
                        ListEmptyComponent={
                            <EmptyState
                                icon="pricetag-outline"
                                title={searchQuery ? UI_TEXT.NO_MATCHING_RESULTS : MESSAGES.EMPTY_PRICE_LIST}
                                description={searchQuery ? `No prices matching "${searchQuery}"` : UI_TEXT.PLUM_COUNT_TITLE}
                            />
                        }
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={10}
                        updateCellsBatchingPeriod={50}
                        initialNumToRender={10}
                        windowSize={10}
                        getItemLayout={(_, index) => ({ length: 72, offset: 72 * index, index })}
                        refreshControl={
                            <RefreshControl
                                refreshing={loading}
                                onRefresh={refresh}
                                colors={[theme.colors.primary]}
                            />
                        }
                        style={styles.priceListFlatList}
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