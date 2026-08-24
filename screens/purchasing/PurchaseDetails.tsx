import { FlatList, RefreshControl, Share, Text as RNText, ToastAndroid, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Input, Text } from '@rneui/base'
import { useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { UI_TEXT, MESSAGES, SAFE_AREA, A11Y_LABELS, DIMENSIONS } from '../../constants'
import { purchaseService } from '../../services/purchaseService'
import { IPurchaseWithSeller } from '../../database'
import { buildPurchasesCsv, formatDate } from '../../utils'
import { IconButton, SecondaryButton } from '../../components/buttons/Button'

export default function PurchaseDetails() {
    const styles = useStyles()
    const { theme } = useTheme()
    const [purchases, setPurchases] = useState<IPurchaseWithSeller[]>([])
    const [loading, setLoading] = useState(false)
    const [searchVisible, setSearchVisible] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

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

    const visiblePurchases = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return purchases
        return purchases.filter(
            (p) =>
                p.category.toLowerCase().includes(query) ||
                (p.seller_name ?? '').toLowerCase().includes(query)
        )
    }, [purchases, searchQuery])

    const grandTotal = visiblePurchases.reduce((sum, p) => sum + p.total, 0)

    const csv = useMemo(() => buildPurchasesCsv(purchases), [purchases])

    const handleToggleSearch = () => {
        setSearchVisible((prev) => {
            if (prev) setSearchQuery('')
            return !prev
        })
    }

    const handleExport = async () => {
        try {
            await Share.share({
                message: csv,
                title: UI_TEXT.EXPORT_CSV,
            })
        } catch {
            ToastAndroid.show(MESSAGES.ERROR_GENERIC, ToastAndroid.LONG)
        }
    }

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
                        <RNText style={styles.purchaseSummaryValue}>{visiblePurchases.length}</RNText>
                    </View>
                    <View style={styles.purchaseSummaryRow}>
                        <RNText style={styles.purchaseSummaryLabel}>{UI_TEXT.TOTAL_VALUE}</RNText>
                        <RNText style={styles.purchaseTotalText}>{grandTotal.toFixed(2)}$</RNText>
                    </View>
                </View>

                <View style={styles.actionButtonsRow}>
                    <SecondaryButton
                        title={UI_TEXT.EXPORT_CSV}
                        disabled={purchases.length === 0}
                        onPress={handleExport}
                        containerStyle={styles.exportButtonContainer}
                    />
                    <IconButton
                        icon={
                            <Ionicons
                                name={searchVisible ? 'search' : 'search-outline'}
                                size={DIMENSIONS.ICON_SIZE_LARGE}
                                color={searchVisible ? theme.colors.primary : theme.colors.tertiary}
                            />
                        }
                        variant="secondary"
                        onPress={handleToggleSearch}
                    />
                </View>

                {searchVisible && (
                    <Input
                        placeholder={UI_TEXT.SEARCH_PURCHASES_PLACEHOLDER}
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
                                accessibilityLabel={A11Y_LABELS.CLEAR_SEARCH}
                            />
                        }
                    />
                )}

                <FlatList
                    data={visiblePurchases}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.purchaseItemRow}>
                            <View style={styles.sellerInfo}>
                                <RNText style={styles.purchaseItemTitle}>
                                    {item.category} ({item.unit})
                                </RNText>
                                <RNText style={styles.purchaseItemSubtitle}>
                                    {formatDate(item.created_at)}
                                    {item.seller_name ? ` · ${UI_TEXT.SOLD_BY}: ${item.seller_name}` : ''}
                                </RNText>
                                <RNText style={styles.purchaseItemSubtitle}>
                                    {item.quantity} × {item.unit_price.toFixed(2)}$
                                </RNText>
                            </View>
                            <RNText style={styles.purchaseItemTotal}>{item.total.toFixed(2)}$</RNText>
                        </View>
                    )}
                    ListEmptyComponent={
                        <RNText style={styles.emptyPriceListText}>
                            {purchases.length > 0 ? UI_TEXT.NO_MATCHING_RESULTS : UI_TEXT.EMPTY_PURCHASE_LIST}
                        </RNText>
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
