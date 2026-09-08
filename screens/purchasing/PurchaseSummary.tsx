import { FlatList, Text as RNText, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { RouteProp, useRoute } from '@react-navigation/native'
import { useStyles } from '../../styles'
import { ROUTES, SAFE_AREA, UI_TEXT } from '../../constants'
import { IPurchaseDetail } from '../../types/database'
import { formatDate } from '../../utils'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'

type PurchaseSummaryRouteProp = RouteProp<
    Record<string, { purchase: IPurchaseDetail }>,
    typeof ROUTES.PURCHASE_SUMMARY
>

function ItemDetailRow({ item }: { item: IPurchaseDetail['items'][number] }) {
    const styles = useStyles()
    return (
        <View style={styles.purchaseDetailItemRow}>
            <View style={styles.purchaseItemQtyBadge}>
                <RNText style={styles.purchaseItemQtyBadgeText}>{item.quantity}</RNText>
            </View>
            <View style={styles.sellerInfo}>
                <RNText style={styles.purchaseItemTitle}>{item.category}</RNText>
                <RNText style={styles.purchaseItemSubtitle}>
                    {item.unit_price.toFixed(2)}$ / {item.unit}
                </RNText>
            </View>
            <RNText style={styles.purchaseDetailItemTotal}>{item.line_total.toFixed(2)}$</RNText>
        </View>
    )
}

function StatCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    const styles = useStyles()
    return (
        <View style={styles.purchaseSummaryStatCell}>
            <RNText style={styles.purchaseSummaryStatValue}>{value}</RNText>
            <RNText style={[styles.purchaseSummaryStatLabel, highlight && styles.purchaseSummaryStatLabelHighlight]}>
                {label}
            </RNText>
        </View>
    )
}

export default function PurchaseSummary() {
    const styles = useStyles()
    const route = useRoute<PurchaseSummaryRouteProp>()
    const purchase = route.params?.purchase

    if (!purchase) {
        return (
            <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.purchaseHistoryScreen}>
                <EmptyState
                    icon="receipt-outline"
                    title={UI_TEXT.EMPTY_PURCHASE_LIST}
                    description={UI_TEXT.PURCHASE_SUMMARY_DESCRIPTION}
                />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.purchaseHistoryScreen}>
            <View style={[styles.purchaseHistoryContainer, styles.fillContainer]}>
                <SectionHeader
                    icon="receipt-outline"
                    title={UI_TEXT.PURCHASE_SUMMARY_TITLE}
                    description={UI_TEXT.PURCHASE_SUMMARY_DESCRIPTION}
                />
                <View style={styles.purchaseSummaryCard}>
                    <View style={styles.purchaseSummaryHeroRow}>
                        <View style={styles.purchaseSummaryAvatar}>
                            <RNText style={styles.purchaseSummaryAvatarText}>
                                {(purchase.seller_name ?? UI_TEXT.NO_SELLER).charAt(0).toUpperCase()}
                            </RNText>
                        </View>
                        <View style={styles.purchaseSummaryHeroText}>
                            <RNText style={styles.purchaseSummarySellerName}>
                                {purchase.seller_name ?? UI_TEXT.NO_SELLER}
                            </RNText>
                            <RNText style={styles.purchaseSummaryDateText}>{formatDate(purchase.created_at)}</RNText>
                        </View>
                    </View>
                    <View style={styles.purchaseSummaryStatsRow}>
                        <StatCell label={UI_TEXT.TOTAL_ITEMS} value={purchase.items.length.toString()} />
                        <View style={styles.purchaseSummaryStatDivider} />
                        <StatCell label={UI_TEXT.TOTAL_AMOUNT} value={`${purchase.total.toFixed(2)}$`} highlight />
                    </View>
                </View>
                <RNText style={styles.priceItemListTitle}>{UI_TEXT.ITEMS}</RNText>
                <FlatList
                    style={styles.purchaseHistoryItems}
                    contentContainerStyle={purchase.items.length === 0 ? styles.recentPurchasesEmpty : undefined}
                    data={purchase.items}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <ItemDetailRow item={item} />}
                    ListEmptyComponent={
                        <EmptyState
                            compact
                            icon="receipt-outline"
                            title={UI_TEXT.EMPTY_PURCHASE_LIST}
                            description={UI_TEXT.PURCHASE_SUMMARY_DESCRIPTION}
                        />
                    }
                />
            </View>
        </SafeAreaView>
    )
}
