import { FlatList, RefreshControl, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { PrimaryButton } from '../../components/buttons/Button'
import { ROUTES, UI_TEXT, MESSAGES, SAFE_AREA, A11Y_LABELS } from '../../constants'
import { sellerService } from '../../services/sellerService'
import { purchaseService } from '../../services/purchaseService'
import { ISeller } from '../../types/database'
import SellerFormSheet from './SellerFormSheet'
import { SearchBar } from '../../components/SearchBar'
import { showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { useSearchFilter } from '../../hooks/useSearchFilter'
import { SearchIconButton } from '../../components/SearchIconButton'
import { SellerRow } from './SellerRow'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'

export default function Sellers() {
    const styles = useStyles()
    const { theme } = useTheme()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const [sellers, setSellers] = useState<ISeller[]>([])
    const [sellerStats, setSellerStats] = useState<Record<number, { count: number; total: number }>>({})
    const { loading, withLoading } = useLoading(false)
    const [sheetVisible, setSheetVisible] = useState(false)
    const [editing, setEditing] = useState<ISeller | null>(null)
    const {
        visible: searchVisible,
        query: searchQuery,
        setQuery: setSearchQuery,
        toggle: handleToggleSearch,
        filtered: visibleSellers,
        hasQuery,
    } = useSearchFilter(
        sellers,
        useCallback(
            (s: ISeller, q: string) =>
                s.name.toLowerCase().includes(q) ||
                (s.phone ?? '').toLowerCase().includes(q),
            []
        )
    )

    const loadSellers = useCallback(async () => {
        await withLoading(async () => {
            try {
                const [sellerList, stats] = await Promise.all([
                    sellerService.getSellers(),
                    purchaseService.getSellerStats().catch(() => []),
                ])
                setSellers(sellerList)
                const statsMap: Record<number, { count: number; total: number }> = {}
                for (const s of stats) {
                    statsMap[s.seller_id] = { count: s.purchase_count, total: s.total_spent }
                }
                setSellerStats(statsMap)
            } catch (error) {
                showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC)
            }
        })
    }, [withLoading])

    useEffect(() => {
        loadSellers()
    }, [loadSellers])

    const handleOpenDetail = useCallback((seller: ISeller) => {
        navigation.navigate(ROUTES.SELLER_DETAILS, { sellerId: seller.id })
    }, [navigation])

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={styles.priceListContainer}>
                <SectionHeader icon="people-outline" title={UI_TEXT.SELLERS} description={`${UI_TEXT.SELLERS_DESCRIPTION} • ${sellers.length} ${sellers.length === 1 ? 'seller' : 'sellers'}`} />

                <View style={styles.sellerActionsRow}>
                    <PrimaryButton
                        title={UI_TEXT.ADD_SELLER}
                        onPress={() => {
                            setEditing(null)
                            setSheetVisible(true)
                        }}
                    />
                    <SearchIconButton
                        active={searchVisible}
                        onPress={handleToggleSearch}
                        accessibilityLabel={A11Y_LABELS.TOGGLE_SEARCH}
                    />
                </View>

                {searchVisible && (
                    <SearchBar
                        placeholder={UI_TEXT.SEARCH_SELLERS_PLACEHOLDER}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                )}

                <FlatList
                    data={visibleSellers}
                    keyExtractor={(item) => item.id.toString()}
                    initialNumToRender={10}
                    windowSize={10}
                    removeClippedSubviews={true}
                    renderItem={({ item }) => (
                        <SellerRow
                            seller={item}
                            purchaseCount={sellerStats[item.id]?.count}
                            purchaseTotal={sellerStats[item.id]?.total}
                            onPress={() => handleOpenDetail(item)}
                            onEdit={() => {
                                setEditing(item)
                                setSheetVisible(true)
                            }}
                        />
                    )}
                    ListEmptyComponent={
                        <EmptyState
                            icon={hasQuery ? 'search-outline' : 'people-outline'}
                            title={hasQuery ? UI_TEXT.NO_MATCHING_RESULTS : UI_TEXT.EMPTY_SELLER_LIST}
                            description={hasQuery ? `No sellers matching "${searchQuery}"` : 'Add your first seller to get started'}
                        />
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={loadSellers}
                            colors={[theme.colors.primary]}
                        />
                    }
                />
            </View>

            <SellerFormSheet
                visible={sheetVisible}
                seller={editing}
                onClose={() => {
                    setSheetVisible(false)
                    setEditing(null)
                }}
                onSaved={loadSellers}
            />
        </SafeAreaView>
    )
}
