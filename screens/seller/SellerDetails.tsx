import { FlatList, Pressable, RefreshControl, Text as RNText, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { A11Y_LABELS, MESSAGES, ROUTES, SAFE_AREA, UI_TEXT } from '../../constants'
import { sellerService } from '../../services/sellerService'
import { purchaseService } from '../../services/purchaseService'
import { IPurchaseWithSeller, ISeller } from '../../types/database'
import { formatDate } from '../../utils'
import { showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { IconButton } from '../../components/buttons/Button'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { CardSkeleton, Skeleton } from '../../components/Skeleton'

type SellerDetailsRouteProp = RouteProp<Record<string, { sellerId: number }>, string>

function StatCell({ label, value, icon }: { label: string; value: string; icon: string }) {
    const styles = useStyles()
    const { theme } = useTheme()
    return (
        <View style={styles.sellerStatCell}>
            <View style={styles.sellerStatIconCircle}>
                <Ionicons name={icon as any} size={16} color={theme.colors.primary} />
            </View>
            <RNText style={styles.sellerStatValue}>{value}</RNText>
            <RNText style={styles.sellerStatLabel}>{label}</RNText>
        </View>
    )
}

export default function SellerDetails() {
    const styles = useStyles()
    const { theme } = useTheme()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const route = useRoute<SellerDetailsRouteProp>()
    const sellerId = route.params?.sellerId

    const [seller, setSeller] = useState<ISeller | null>(null)
    const [purchases, setPurchases] = useState<IPurchaseWithSeller[]>([])
    const [notFound, setNotFound] = useState(false)
    const { loading, withLoading } = useLoading(false)

    const confirmDelete = useConfirmDelete<[number]>({
        remove: (id) => sellerService.removeSeller(id),
        confirmMessage: UI_TEXT.DELETE_SELLER_CONFIRM_MESSAGE,
        successMessage: MESSAGES.SELLER_DELETE_SUCCESS,
        onDeleted: () => navigation.goBack(),
    })

    const loadDetails = useCallback(async () => {
        if (sellerId === undefined || sellerId === null) {
            setNotFound(true)
            return
        }
        await withLoading(async () => {
            try {
                const [found, history] = await Promise.all([
                    sellerService.getSellerById(sellerId),
                    purchaseService.getPurchasesBySeller(sellerId).catch(() => [] as IPurchaseWithSeller[]),
                ])
                if (!found) {
                    setNotFound(true)
                    return
                }
                setNotFound(false)
                setSeller(found)
                setPurchases(history)
            } catch (error) {
                showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC)
            }
        })
    }, [sellerId, withLoading])

    useEffect(() => {
        loadDetails()
    }, [loadDetails])

    const total = purchases.reduce((sum, p) => sum + p.total, 0)
    const average = purchases.length > 0 ? total / purchases.length : 0
    const headerDescription: React.ReactNode | undefined = seller
        ? (() => {
              const hasPhone = !!seller.phone?.trim()
              const hasAddress = !!seller.address?.trim()
              if (!hasPhone && !hasAddress) return undefined
              return (
                  <>
                      {hasPhone && (
                          <View style={styles.sectionHeaderContactRow}>
                              <Ionicons name="call-outline" size={14} color={theme.colors.grey4} />
                              <RNText style={styles.sectionHeaderContactText}>{seller.phone!.trim()}</RNText>
                          </View>
                      )}
                      {hasPhone && hasAddress && (
                          <RNText style={styles.sectionHeaderContactText}>·</RNText>
                      )}
                      {hasAddress && (
                          <View style={styles.sectionHeaderContactRow}>
                              <Ionicons name="location-outline" size={14} color={theme.colors.grey4} />
                              <RNText style={styles.sectionHeaderContactText}>{seller.address!.trim()}</RNText>
                          </View>
                      )}
                  </>
              )
          })()
        : undefined

    if (notFound) {
        return (
            <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.priceListScreen}>
                <View style={styles.priceListContainer}>
                    <View style={styles.sellerDetailsBackRow}>
                        <IconButton
                            icon={<Ionicons name="arrow-back" size={22} color={theme.colors.primary} />}
                            variant="ghost"
                            onPress={() => navigation.goBack()}
                            accessibilityLabel={A11Y_LABELS.GO_BACK}
                        />
                        <RNText style={styles.sellerDetailsBackTitle}>{UI_TEXT.SELLERS}</RNText>
                    </View>
                    <EmptyState
                        icon="people-outline"
                        title={UI_TEXT.EMPTY_SELLER_LIST}
                        description="Seller not found"
                    />
                </View>
            </SafeAreaView>
        )
    }

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
                    <RNText style={styles.sellerDetailsBackTitle}>{UI_TEXT.SELLERS}</RNText>
                </View>

                {seller ? (
                    <>
                        <SectionHeader
                            icon="person-outline"
                            title={seller.name}
                            description={headerDescription}
                            action={
                                <Pressable
                                    onPress={() => seller && confirmDelete(seller.id)}
                                    hitSlop={8}
                                    accessibilityRole="button"
                                    accessibilityLabel={A11Y_LABELS.DELETE_SELLER}
                                    style={({ pressed }) => [
                                        styles.sellerDeleteButton,
                                        pressed && styles.sellerDeleteButtonPressed,
                                    ]}
                                >
                                    <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                                </Pressable>
                            }
                        />

                        <View style={styles.sellerStatsRow}>
                            <StatCell label={UI_TEXT.PURCHASES_COUNT} value={String(purchases.length)} icon="receipt-outline" />
                            <View style={styles.sellerStatDivider} />
                            <StatCell label={UI_TEXT.TOTAL_VALUE} value={`${total.toFixed(2)}$`} icon="wallet-outline" />
                            <View style={styles.sellerStatDivider} />
                            <StatCell label={UI_TEXT.AVERAGE_VALUE} value={`${average.toFixed(2)}$`} icon="analytics-outline" />
                        </View>

                        <View style={styles.sellerSectionSpacer}>
                            <SectionHeader
                                icon="time-outline"
                                title={UI_TEXT.RECENT_PURCHASES}
                                description={
                                    purchases.length > 0
                                        ? `Last ${Math.min(purchases.length, 20)} transactions`
                                        : undefined
                                }
                            />
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.sellerProfileCard}>
                            <Skeleton width={56} height={56} radius={28} />
                            <View style={styles.sellerProfileSkeletonText}>
                                <Skeleton width="60%" height={16} />
                                <Skeleton width="40%" height={12} />
                            </View>
                        </View>
                        <View style={styles.sellerStatsRow}>
                            <View style={styles.sellerStatCell}>
                                <Skeleton width={32} height={32} radius={16} />
                                <Skeleton width="70%" height={14} />
                                <Skeleton width="50%" height={10} />
                            </View>
                            <View style={styles.sellerStatDivider} />
                            <View style={styles.sellerStatCell}>
                                <Skeleton width={32} height={32} radius={16} />
                                <Skeleton width="70%" height={14} />
                                <Skeleton width="50%" height={10} />
                            </View>
                            <View style={styles.sellerStatDivider} />
                            <View style={styles.sellerStatCell}>
                                <Skeleton width={32} height={32} radius={16} />
                                <Skeleton width="70%" height={14} />
                                <Skeleton width="50%" height={10} />
                            </View>
                        </View>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                )}

                {seller && (
                    <FlatList
                        data={purchases.slice(0, 20)}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.purchaseItemRow}>
                                <View style={styles.sellerInfo}>
                                    <RNText style={styles.purchaseItemTitle}>
                                        {item.category} × {item.quantity}
                                    </RNText>
                                    <RNText style={styles.purchaseItemSubtitle}>
                                        {formatDate(item.created_at)} · {item.unit} @ {item.unit_price.toFixed(2)}$
                                    </RNText>
                                    <RNText style={styles.purchaseItemSubtitle}>
                                        {item.quantity} × {item.unit_price.toFixed(2)}$ = {item.total.toFixed(2)}$
                                    </RNText>
                                </View>
                                <RNText style={styles.purchaseItemTotal}>{item.total.toFixed(2)}$</RNText>
                            </View>
                        )}
                        ListEmptyComponent={
                            !loading ? (
                                <EmptyState
                                    icon="receipt-outline"
                                    title={UI_TEXT.EMPTY_PURCHASE_LIST}
                                    description={`No purchases recorded for ${seller.name} yet`}
                                />
                            ) : null
                        }
                        refreshControl={
                            <RefreshControl refreshing={loading} onRefresh={loadDetails} colors={[theme.colors.primary]} />
                        }
                        style={styles.recentPurchasesList}
                        contentContainerStyle={
                            purchases.length === 0
                                ? styles.recentPurchasesEmpty
                                : ({ paddingBottom: 16 } as any)
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    )
}

export const SELLER_DETAILS_ROUTE = ROUTES.SELLER_DETAILS
