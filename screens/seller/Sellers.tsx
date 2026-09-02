import { Alert, FlatList, RefreshControl, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { IconButton, PrimaryButton } from '../../components/buttons/Button'
import { UI_TEXT, MESSAGES, SAFE_AREA, DIMENSIONS, A11Y_LABELS } from '../../constants'
import { sellerService } from '../../services/sellerService'
import { purchaseService } from '../../services/purchaseService'
import { DatabaseError } from '../../database/connection'
import { ISeller, IPurchaseWithSeller } from '../../types/database'
import SellerFormSheet from './SellerFormSheet'
import { SearchBar } from '../../components/SearchBar'
import { showSuccess, showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { SellerRow } from './SellerRow'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { SellerDetailSheet } from '../../components/SellerDetailSheet'
// import { buildSellersCsvWithBom, getCsvFilename } from '../../utils'
// import { shareOrSaveCsv } from '../../utils/csvExport'

export default function Sellers() {
    const styles = useStyles()
    const { theme } = useTheme()
    const [sellers, setSellers] = useState<ISeller[]>([])
    const [sellerStats, setSellerStats] = useState<Record<number, { count: number; total: number }>>({})
    const [detailSeller, setDetailSeller] = useState<ISeller | null>(null)
    const [detailPurchases, setDetailPurchases] = useState<IPurchaseWithSeller[]>([])
    const { loading, withLoading } = useLoading(false)
    const [sheetVisible, setSheetVisible] = useState(false)
    const [editing, setEditing] = useState<ISeller | null>(null)
    const [searchVisible, setSearchVisible] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

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

    const handleOpenDetail = useCallback(async (seller: ISeller) => {
        setDetailSeller(seller)
        setDetailPurchases([])
        try {
            setDetailPurchases(await purchaseService.getPurchasesBySeller(seller.id))
        } catch {
            // detail sheet shows an empty list on failure
        }
    }, [])

    const visibleSellers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return sellers
        return sellers.filter(
            (s) =>
                s.name.toLowerCase().includes(query) ||
                (s.phone ?? '').toLowerCase().includes(query)
        )
    }, [sellers, searchQuery])

    const handleToggleSearch = () => {
        setSearchVisible((prev) => {
            if (prev) setSearchQuery('')
            return !prev
        })
    }

    const confirmDelete = (id: number) => {
        Alert.alert(
            UI_TEXT.DELETE_CONFIRM_TITLE,
            UI_TEXT.DELETE_SELLER_CONFIRM_MESSAGE,
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
            await sellerService.removeSeller(id)
            showSuccess(MESSAGES.SELLER_DELETE_SUCCESS)
            await loadSellers()
        } catch (error) {
            const message = error instanceof DatabaseError ? error.message : MESSAGES.ERROR_GENERIC
            showError(message)
        }
    }

    // const _handleExport = async () => {
    //     if (sellers.length === 0) {
    //         showError(UI_TEXT.EMPTY_SELLER_LIST)
    //         return
    //     }
    //     const filename = getCsvFilename('sellers')
    //     const result = await shareOrSaveCsv(
    //         buildSellersCsvWithBom(sellers),
    //         filename,
    //         UI_TEXT.EXPORT_CSV
    //     )
    //     if (result === 'failed') showError(MESSAGES.ERROR_GENERIC)
    //     else showSuccess(`${UI_TEXT.EXPORT_CSV} — ${sellers.length} rows`)
    // }

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
                    {/* <IconButton
                        icon={
                            <Ionicons
                                name="download-outline"
                                size={DIMENSIONS.ICON_SIZE_MEDIUM}
                                color={theme.colors.grey4}
                            />
                        }
                        variant="ghost"
                        onPress={_handleExport}
                        accessibilityLabel={UI_TEXT.EXPORT_CSV}
                    /> */}
                    <IconButton
                        icon={
                            <Ionicons
                                name={searchVisible ? 'search' : 'search-outline'}
                                size={DIMENSIONS.ICON_SIZE_MEDIUM}
                                color={searchVisible ? theme.colors.primary : theme.colors.grey4}
                            />
                        }
                        variant="ghost"
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
                    getItemLayout={(_, index) => ({ length: 72, offset: 72 * index, index })}
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
                            onDelete={() => confirmDelete(item.id)}
                        />
                    )}
                    ListEmptyComponent={
                        <EmptyState
                            icon={sellers.length > 0 ? 'search-outline' : 'people-outline'}
                            title={sellers.length > 0 ? UI_TEXT.NO_MATCHING_RESULTS : UI_TEXT.EMPTY_SELLER_LIST}
                            description={sellers.length > 0 ? `No sellers matching "${searchQuery}"` : 'Add your first seller to get started'}
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
                onClose={() => setSheetVisible(false)}
                onSaved={loadSellers}
            />
            <SellerDetailSheet visible={!!detailSeller} seller={detailSeller} purchases={detailPurchases} onClose={() => setDetailSeller(null)} />
        </SafeAreaView>
    )
}
