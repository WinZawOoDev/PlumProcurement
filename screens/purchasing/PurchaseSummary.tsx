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
        <View style={styles.purchaseItemRow}>
            <View style={styles.sellerInfo}>
                <RNText style={styles.purchaseItemTitle}>{item.category}</RNText>
                <RNText style={styles.purchaseItemSubtitle}>
                    {item.quantity} × {item.unit_price.toFixed(2)}$ / {item.unit}
                </RNText>
            </View>
            <RNText style={styles.purchaseItemTotal}>{item.line_total.toFixed(2)}$</RNText>
        </View>
    )
}

function SummaryMetaRow({ label, value }: { label: string; value: string }) {
    const styles = useStyles()
    return (
        <View style={styles.purchaseSummaryRow}>
            <RNText style={styles.purchaseSummaryLabel}>{label}</RNText>
            <RNText style={styles.purchaseSummaryValue}>{value}</RNText>
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
                    <SummaryMetaRow
                        label={UI_TEXT.SELECT_SELLER}
                        value={purchase.seller_name ?? UI_TEXT.NO_SELLER}
                    />
                    <SummaryMetaRow label={UI_TEXT.PURCHASE_DATE} value={formatDate(purchase.created_at)} />
                    <SummaryMetaRow label={UI_TEXT.ITEMS} value={purchase.items.length.toString()} />
                    <View style={[styles.purchaseSummaryRow, styles.purchaseDetailsSummaryDivider]}>
                        <RNText style={styles.purchaseSummaryLabel}>{UI_TEXT.TOTAL}</RNText>
                        <RNText style={styles.purchaseTotalText}>{purchase.total.toFixed(2)}$</RNText>
                    </View>
                </View>
                <FlatList
                    style={styles.purchaseHistoryItems}
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
