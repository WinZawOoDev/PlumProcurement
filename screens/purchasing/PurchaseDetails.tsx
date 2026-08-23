import { FlatList, RefreshControl, Text as RNText, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@rneui/base'
import { useTheme } from '@rneui/themed'
import { useStyles } from '../../styles'
import { UI_TEXT, SAFE_AREA } from '../../constants'
import { purchaseService } from '../../services/purchaseService'
import { IPurchaseWithSeller } from '../../database'

export default function PurchaseDetails() {
    const styles = useStyles()
    const { theme } = useTheme()
    const [purchases, setPurchases] = useState<IPurchaseWithSeller[]>([])
    const [loading, setLoading] = useState(false)

    const loadPurchases = useCallback(async () => {
        setLoading(true)
        try {
            setPurchases(await purchaseService.getPurchases())
        } catch (error) {
            console.error('Failed to fetch purchases:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadPurchases()
    }, [loadPurchases])

    const grandTotal = purchases.reduce((sum, p) => sum + p.total, 0)

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
            <View style={styles.priceListContainer}>
                <View style={styles.titleDescription}>
                    <Text style={styles.titleText}>{UI_TEXT.PURCHASE_HISTORY_TITLE}</Text>
                    <Text style={styles.descriptionText}>{UI_TEXT.PURCHASE_HISTORY_DESCRIPTION}</Text>
                </View>

                <View style={styles.purchaseSummaryCard}>
                    <View style={styles.purchaseSummaryRow}>
                        <RNText style={styles.purchaseSummaryLabel}>{UI_TEXT.PURCHASES_COUNT}</RNText>
                        <RNText style={styles.purchaseSummaryValue}>{purchases.length}</RNText>
                    </View>
                    <View style={styles.purchaseSummaryRow}>
                        <RNText style={styles.purchaseSummaryLabel}>{UI_TEXT.TOTAL_VALUE}</RNText>
                        <RNText style={styles.purchaseTotalText}>{grandTotal.toFixed(2)}$</RNText>
                    </View>
                </View>

                <FlatList
                    data={purchases}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.purchaseItemRow}>
                            <View style={styles.sellerInfo}>
                                <RNText style={styles.purchaseItemTitle}>
                                    {item.category} ({item.unit})
                                </RNText>
                                <RNText style={styles.purchaseItemSubtitle}>
                                    {item.quantity} × {item.unit_price.toFixed(2)}$
                                    {item.seller_name ? ` · ${UI_TEXT.SOLD_BY}: ${item.seller_name}` : ''}
                                </RNText>
                            </View>
                            <RNText style={styles.purchaseItemTotal}>{item.total.toFixed(2)}$</RNText>
                        </View>
                    )}
                    ListEmptyComponent={
                        <RNText style={styles.emptyPriceListText}>{UI_TEXT.EMPTY_PURCHASE_LIST}</RNText>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={loadPurchases}
                            colors={[theme.colors.primary]}
                        />
                    }
                />
            </View>
        </SafeAreaView>
    )
}
