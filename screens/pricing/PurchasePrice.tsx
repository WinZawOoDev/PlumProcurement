import { RefreshControl, View, Text, FlatList, ToastAndroid } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Input } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { SafeAreaView } from 'react-native-safe-area-context'
import PriceCard from './PriceCard'
import ActionButtons from './ActionButtons'
import { usePrices } from '../../context/PriceContext'
import EditPrice from './EditPrice'
import { SAFE_AREA, UI_TEXT, MESSAGES, SORT_MODES, SortMode } from '../../constants'
import { IPrice } from '../../database'

export default function PurchasePrices() {
    const styles = useStyles()
    const { theme } = useTheme()
    const { prices, loading, refresh, removePrice } = usePrices()
    const [editing, setEditing] = useState<IPrice | null>(null)
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

    const handleDelete = async (id: number) => {
        try {
            await removePrice(id)
            ToastAndroid.show(MESSAGES.PRICE_DELETE_SUCCESS, ToastAndroid.SHORT)
        } catch {
            ToastAndroid.show(MESSAGES.ERROR_GENERIC, ToastAndroid.LONG)
        }
    }

    return (
        <SafeAreaView
            edges={SAFE_AREA.EDGES}
            style={styles.priceListScreen}
        >
            <View style={styles.priceListContainer}>
                <TitleAndDescription />
                <ActionButtons
                    searchActive={searchVisible}
                    onSearchPress={handleToggleSearch}
                    sortActive={sortMode !== 'default'}
                    sortDirection={sortMode === 'price_asc' ? 'asc' : 'desc'}
                    onSortPress={handleSortPress}
                />
                {searchVisible && (
                    <Input
                        placeholder={UI_TEXT.SEARCH_PRICES_PLACEHOLDER}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        inputContainerStyle={styles.formInputContainer}
                        inputStyle={styles.formInput}
                        containerStyle={styles.searchBarContainer}
                        rightIcon={
                            <Ionicons
                                name="close-circle-outline"
                                size={22}
                                color={theme.colors.tertiary}
                                onPress={() => setSearchQuery('')}
                            />
                        }
                    />
                )}
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
                    ListEmptyComponent={<EmptyPriceList />}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                    initialNumToRender={10}
                    windowSize={10}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={refresh}
                            colors={[theme.colors.primary]}
                        />
                    }
                    style={styles.priceListFlatList}
                />
                <EditPrice
                    visible={!!editing}
                    price={editing}
                    onClose={() => setEditing(null)}
                />
            </View>
        </SafeAreaView>
    )
}

function EmptyPriceList() {
    const styles = useStyles()

    return (
        <View style={styles.emptyPriceListContainer}>
            <Text style={styles.emptyPriceListText}>{UI_TEXT.PLUM_COUNT_TITLE}</Text>
        </View>
    )
}

function TitleAndDescription() {
    const styles = useStyles()
    return (
        <View style={styles.titleDescription}>
            <Text style={styles.titleText}>{UI_TEXT.PRICE_MANAGEMENT}</Text>
            <Text style={styles.descriptionText}>
                {UI_TEXT.PRICE_DESCRIPTION}
            </Text>
        </View>
    )
}