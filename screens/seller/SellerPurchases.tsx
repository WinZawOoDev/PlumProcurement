import { FlatList, Pressable, RefreshControl, Text as RNText, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { A11Y_LABELS, MESSAGES, ROUTES, SAFE_AREA, UI_TEXT } from '../../constants'
import { purchaseService } from '../../services/purchaseService'
import { IPurchaseDetail } from '../../types/database'
import { formatDate } from '../../utils'
import { showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { CardSkeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { IconButton } from '../../components/buttons/Button'

type SellerPurchasesRouteProp = RouteProp<Record<string, { sellerId: number }>, string>

function SellerPurchasesRow({ item }: { item: IPurchaseDetail }) {
    const styles = useStyles()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    return (
        <Pressable
            style={styles.purchaseItemRow}
            onPress={() =>
                navigation.navigate(ROUTES.PURCHASE_SUMMARY, { purchase: item })
            }
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${UI_TEXT.PURCHASE_SUMMARY_TITLE}: ${item.seller_name ?? UI_TEXT.NO_SELLER}`}
        >
            <View style={styles.sellerInfo}>
                <RNText style={styles.purchaseItemTitle}>
                    {formatDate(item.created_at)}
                </RNText>
                <RNText style={styles.purchaseItemSubtitle}>
                    {item.items.length} {UI_TEXT.ITEMS.toLowerCase()}
                </RNText>
            </View>
            <View style={styles.purchaseItemActions}>
                <RNText style={styles.purchaseItemTotal}>{item.total.toFixed(2)}$</RNText>
            </View>
        </Pressable>
    )
}

export default function SellerPurchases() {
    const styles = useStyles()
    const { theme } = useTheme()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const route = useRoute<SellerPurchasesRouteProp>()
    const sellerId = route.params?.sellerId

    const [purchases, setPurchases] = useState<IPurchaseDetail[]>([])
    const { loading, withLoading } = useLoading(false)

    const loadPurchases = useCallback(async () => {
        if (sellerId === undefined || sellerId === null) {
            return
        }
        await withLoading(async () => {
            try {
                setPurchases(await purchaseService.getPurchasesBySeller(sellerId))
            } catch (error) {
                showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC)
            }
        })
    }, [sellerId, withLoading])

    React.useEffect(() => {
        loadPurchases()
    }, [loadPurchases])

    const total = purchases.reduce((sum, p) => sum + p.total, 0)

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={[styles.priceListContainer, styles.fillContainer]}>
                <View style={styles.sellerDetailsBackRow}>
                    <IconButton
                        icon={<Ionicons name="arrow-back" size={22} color={theme.colors.primary} />}
                        variant="ghost"
                        onPress={() => navigation.goBack()}
                        accessibilityLabel={A11Y_LABELS.GO_BACK}
                    />
                    <RNText style={styles.sellerDetailsBackTitle}>{UI_TEXT.PURCHASE_HISTORY_TITLE}</RNText>
                </View>

                <View style={styles.recentPurchasesHeader}>
                    <RNText style={styles.recentPurchasesTitle}>{UI_TEXT.RECENT_PURCHASES}</RNText>
                    <RNText style={styles.recentPurchasesCount}>
                        {purchases.length > 0 ? `${purchases.length} · ${total.toFixed(2)}$` : ''}
                    </RNText>
                </View>

                {loading && purchases.length === 0 ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    <FlatList
                        style={styles.recentPurchasesList}
                        data={purchases}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <SellerPurchasesRow item={item} />}
                        refreshControl={
                            <RefreshControl
                                refreshing={loading}
                                onRefresh={loadPurchases}
                                colors={[theme.colors.primary]}
                            />
                        }
                        ListEmptyComponent={
                            loading ? null : (
                                <EmptyState
                                    icon="receipt-outline"
                                    title={UI_TEXT.EMPTY_PURCHASE_LIST}
                                    description={UI_TEXT.PURCHASE_HISTORY_DESCRIPTION}
                                />
                            )
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    )
}
