import { FlatList, Pressable, Text as RNText, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { A11Y_LABELS, MESSAGES, ROUTES, SAFE_AREA, UI_TEXT } from '../../constants'
import { sellerService } from '../../services/sellerService'
import { ISeller } from '../../types/database'
import { showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { lightHaptic } from '../../utils/haptics'
import { SearchBar } from '../../components/SearchBar'
import { EmptyState } from '../../components/EmptyState'
import { CardSkeleton } from '../../components/Skeleton'
import { IconButton } from '../../components/buttons/Button'

type SellerSelectRouteProp = RouteProp<
    Record<string, { currentSellerId?: number }>,
    typeof ROUTES.SELECT_SELLER
>

function ItemSeparator() {
    const styles = useStyles()
    return <View style={styles.sellerSelectSeparator} />
}

export default function SellerSelect() {
    const styles = useStyles()
    const { theme } = useTheme()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const route = useRoute<SellerSelectRouteProp>()
    const currentSellerId = route.params?.currentSellerId

    const [sellers, setSellers] = useState<ISeller[]>([])
    const [query, setQuery] = useState('')
    const { loading, withLoading } = useLoading(false)

    useEffect(() => {
        withLoading(async () => {
            try {
                setSellers(await sellerService.getSellers())
            } catch (error) {
                showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC)
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const filtered = useMemo(
        () =>
            [...sellers]
                .filter((s) => {
                    const q = query.trim().toLowerCase()
                    if (!q) return true
                    return (
                        s.name.toLowerCase().includes(q) ||
                        (s.phone ?? '').toLowerCase().includes(q)
                    )
                })
                .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
        [sellers, query],
    )

    const handleSelect = useCallback(
        (seller: ISeller) => {
            lightHaptic()
            navigation.navigate(ROUTES.PURCHASE, {
                selectedSellerId: seller.id,
                selectedSellerName: seller.name,
            })
        },
        [navigation],
    )

    const countLabel = query.trim()
        ? `${filtered.length} of ${sellers.length}`
        : `${sellers.length}`

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
                    <RNText style={styles.sellerDetailsBackTitle}>{UI_TEXT.SELECT_SELLER}</RNText>
                    <View style={styles.fillContainer} />
                    <RNText style={styles.recentPurchasesCount}>{countLabel}</RNText>
                </View>

                <SearchBar
                    placeholder={UI_TEXT.SEARCH_SELLERS_PLACEHOLDER}
                    value={query}
                    onChangeText={setQuery}
                />

                {loading && sellers.length === 0 ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    <FlatList
                        style={styles.recentPurchasesList}
                        data={filtered}
                        keyExtractor={(item) => item.id.toString()}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        ItemSeparatorComponent={ItemSeparator}
                        renderItem={({ item }) => {
                            const selected = item.id === currentSellerId
                            return (
                                <Pressable
                                    onPress={() => handleSelect(item)}
                                    style={({ pressed }) => [
                                        styles.purchaseItemRow,
                                        styles.sellerSelectRow,
                                        pressed && styles.sellerDeleteButtonPressed,
                                    ]}
                                    accessible
                                    accessibilityRole="button"
                                    accessibilityLabel={item.name}
                                    accessibilityState={{ selected }}
                                >
                                    <View style={styles.sellerInfo}>
                                        <RNText style={styles.purchaseItemTitle}>
                                            {item.name}
                                        </RNText>
                                        {!!item.phone && (
                                            <RNText style={styles.purchaseItemSubtitle}>
                                                {item.phone}
                                            </RNText>
                                        )}
                                    </View>
                                    {selected && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={22}
                                            color={theme.colors.primary}
                                        />
                                    )}
                                </Pressable>
                            )
                        }}
                        ListEmptyComponent={
                            <EmptyState
                                compact
                                icon="people-outline"
                                title={UI_TEXT.EMPTY_SELLER_LIST}
                                description={
                                    sellers.length === 0
                                        ? UI_TEXT.SELECT_SELLER_PLACEHOLDER
                                        : `No sellers matching "${query.trim()}"`
                                }
                            />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    )
}
