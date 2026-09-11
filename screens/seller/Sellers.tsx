import { FlatList, RefreshControl, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStyles } from '../../styles'
import { useTheme } from '@rneui/themed'
import { useTranslation } from 'react-i18next'
import { PrimaryButton } from '../../components/buttons/Button'
import { ROUTES, SAFE_AREA } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { sellerService } from '../../services/sellerService'
import { purchaseService } from '../../services/purchaseService'
import { paymentService } from '../../services/paymentService'
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
import { Skeleton } from '../../components/Skeleton'

type SellerStats = Record<number, { count: number; total: number }>

function SellerHeader({ count }: { count: number }) {
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <SectionHeader
            icon="people-outline"
            title={UI_TEXT.SELLERS}
            description={`${UI_TEXT.SELLERS_DESCRIPTION} • ${count} ${count === 1 ? UI_TEXT.SELLER_SINGULAR : UI_TEXT.SELLER_PLURAL}`}
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

function SellerList({
    sellers,
    sellerStats,
    balances,
    loading,
    hasQuery,
    searchQuery,
    onRefresh,
    onOpenDetail,
    onEdit,
}: {
    sellers: ISeller[]
    sellerStats: SellerStats
    balances: Record<number, number>
    loading: boolean
    hasQuery: boolean
    searchQuery: string
    onRefresh: () => void
    onOpenDetail: (seller: ISeller) => void
    onEdit: (seller: ISeller) => void
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
                    purchaseCount={sellerStats[item.id]?.count}
                    purchaseTotal={sellerStats[item.id]?.total}
                    balance={balances[item.id]}
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
    seller: ISeller | null
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
    const [sellers, setSellers] = useState<ISeller[]>([])
    const [sellerStats, setSellerStats] = useState<SellerStats>({})
    const [balances, setBalances] = useState<Record<number, number>>({})
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
                const [sellerList, stats, summaries] = await Promise.all([
                    sellerService.getSellers(),
                    purchaseService.getSellerStats().catch(() => []),
                    paymentService.getPaymentSummaries().catch(() => []),
                ])
                setSellers(sellerList)
                const statsMap: Record<number, { count: number; total: number }> = {}
                for (const s of stats) {
                    statsMap[s.seller_id] = { count: s.purchase_count, total: s.total_spent }
                }
                setSellerStats(statsMap)
                const balanceMap: Record<number, number> = {}
                for (const s of summaries) {
                    balanceMap[s.seller_id] = s.balance
                }
                setBalances(balanceMap)
            } catch (error) {
                showError((error as Error)?.message ?? t('messages.ERROR_GENERIC'))
            }
        })
    }, [withLoading, t])

    useEffect(() => {
        loadSellers()
    }, [loadSellers])

    const handleOpenDetail = useCallback((seller: ISeller) => {
        navigation.navigate(ROUTES.SELLER_DETAILS, { sellerId: seller.id })
    }, [navigation])

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={styles.priceListContainer}>
                <SellerHeader count={sellers.length} />
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
                <SellerList
                    sellers={visibleSellers}
                    sellerStats={sellerStats}
                    balances={balances}
                    loading={loading}
                    hasQuery={hasQuery}
                    searchQuery={searchQuery}
                    onRefresh={loadSellers}
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
                onSaved={loadSellers}
            />
        </SafeAreaView>
    )
}
