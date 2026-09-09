import { Pressable, RefreshControl, ScrollView, Text as RNText, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { A11Y_LABELS, MESSAGES, ROUTES, SAFE_AREA, UI_TEXT, PAYMENT_METHODS } from '../../constants'
import { sellerService } from '../../services/sellerService'
import { purchaseService } from '../../services/purchaseService'
import { paymentService } from '../../services/paymentService'
import { ISeller, ISellerPaymentStat, IPayment, IPurchaseDetail } from '../../types/database'
import { formatDate } from '../../utils'
import { showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { IconButton, PrimaryButton } from '../../components/buttons/Button'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { Skeleton } from '../../components/Skeleton'
import { StatCell } from '../../components/StatCell'
import PaymentFormSheet from './PaymentFormSheet'

type SellerDetailsRouteProp = RouteProp<Record<string, { sellerId: number }>, string>

function SellerBackRow({ onBack }: { onBack: () => void }) {
    const styles = useStyles()
    const { theme } = useTheme()
    return (
        <View style={styles.sellerDetailsBackRow}>
            <IconButton
                icon={<Ionicons name="arrow-back" size={22} color={theme.colors.primary} />}
                variant="ghost"
                onPress={onBack}
                accessibilityLabel={A11Y_LABELS.GO_BACK}
            />
            <RNText style={styles.sellerDetailsBackTitle}>{UI_TEXT.SELLERS}</RNText>
        </View>
    )
}

function SellerProfileHeader({
    seller,
    description,
    onDelete,
}: {
    seller: ISeller
    description: React.ReactNode | undefined
    onDelete: () => void
}) {
    const styles = useStyles()
    const { theme } = useTheme()
    return (
        <SectionHeader
            icon="person-outline"
            title={seller.name}
            description={description}
            action={
                <Pressable
                    onPress={onDelete}
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
    )
}

function ViewAllLink({ onPress }: { onPress: () => void }) {
    const styles = useStyles()
    const { theme } = useTheme()
    return (
        <Pressable
            onPress={onPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={UI_TEXT.VIEW_ALL}
            style={({ pressed }) => [
                styles.sellerSectionAction,
                pressed && styles.sellerDeleteButtonPressed,
            ]}
        >
            <RNText style={styles.sellerSummaryCardFooterText}>{UI_TEXT.VIEW_ALL}</RNText>
            <Ionicons name="chevron-forward" size={14} color={theme.colors.grey3} />
        </Pressable>
    )
}

function PurchasesSection({
    count,
    total,
    onPress,
}: {
    count: number
    total: number
    onPress: () => void
}) {
    const styles = useStyles()
    const average = count > 0 ? total / count : 0
    return (
        <View style={styles.sellerSectionSpacer}>
            <SectionHeader
                icon="receipt-outline"
                title={UI_TEXT.PURCHASE_HISTORY_TITLE}
            />
            <Pressable
                onPress={onPress}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${UI_TEXT.PURCHASE_HISTORY_TITLE}: ${UI_TEXT.VIEW_ALL}`}
            >
                <View style={styles.sellerStatsRow}>
                    <StatCell label={UI_TEXT.PURCHASES_COUNT} value={String(count)} icon="receipt-outline" />
                    <View style={styles.sellerStatDivider} />
                    <StatCell label={UI_TEXT.TOTAL_VALUE} value={`${total.toFixed(2)}$`} icon="wallet-outline" />
                    <View style={styles.sellerStatDivider} />
                    <StatCell label={UI_TEXT.AVERAGE_VALUE} value={`${average.toFixed(2)}$`} icon="analytics-outline" />
                </View>
            </Pressable>
        </View>
    )
}

function PaymentsSection({
    stat,
    onPress,
}: {
    stat: ISellerPaymentStat | null
    onPress: () => void
}) {
    const styles = useStyles()
    return (
        <View style={styles.sellerSectionSpacer}>
            <SectionHeader
                icon="wallet-outline"
                title={UI_TEXT.PAYMENT_HISTORY}
                description={
                    stat && stat.balance > 0
                        ? `${UI_TEXT.BALANCE}: ${stat.balance.toFixed(2)}$`
                        : undefined
                }
            />
            <Pressable
                onPress={onPress}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${UI_TEXT.PAYMENT_HISTORY}: ${UI_TEXT.VIEW_ALL}`}
            >
                <View style={styles.sellerStatsRow}>
                    <StatCell label={UI_TEXT.OWED} value={`${(stat?.total_owed ?? 0).toFixed(2)}$`} icon="cart-outline" />
                    <View style={styles.sellerStatDivider} />
                    <StatCell label={UI_TEXT.PAID} value={`${(stat?.total_paid ?? 0).toFixed(2)}$`} icon="checkmark-circle-outline" />
                    <View style={styles.sellerStatDivider} />
                    <StatCell label={UI_TEXT.BALANCE} value={`${(stat?.balance ?? 0).toFixed(2)}$`} icon="wallet-outline" />
                </View>
            </Pressable>
        </View>
    )
}

function methodLabel(method: string | null): string {
    if (!method) return ''
    return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method
}

function RecentPaymentRow({ item, isLast }: { item: IPayment; isLast?: boolean }) {
    const styles = useStyles()
    return (
        <View style={[styles.purchaseItemRow, styles.sellerRecentRow, isLast && styles.sellerRecentRowLast]}>
            <View style={styles.sellerInfo}>
                <RNText style={styles.sellerRecentTitle}>{item.amount.toFixed(2)}$</RNText>
                <RNText style={styles.sellerRecentSubtitle}>
                    {formatDate(item.paid_at)}
                    {item.method ? ` · ${methodLabel(item.method)}` : ''}
                </RNText>
            </View>
        </View>
    )
}

function RecentPurchaseRow({ item, isLast }: { item: IPurchaseDetail; isLast?: boolean }) {
    const styles = useStyles()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    return (
        <Pressable
            style={[styles.purchaseItemRow, styles.sellerRecentRow, isLast && styles.sellerRecentRowLast]}
            onPress={() => navigation.navigate(ROUTES.PURCHASE_SUMMARY, { purchase: item })}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${UI_TEXT.PURCHASE_SUMMARY_TITLE}: ${formatDate(item.created_at)}`}
        >
            <View style={styles.sellerInfo}>
                <RNText style={styles.sellerRecentTitle}>{formatDate(item.created_at)}</RNText>
                <RNText style={styles.sellerRecentSubtitle}>
                    {item.items.length} {UI_TEXT.ITEMS.toLowerCase()}
                </RNText>
            </View>
            <View style={styles.purchaseItemActions}>
                <RNText style={styles.sellerRecentTotal}>{item.total.toFixed(2)}$</RNText>
            </View>
        </Pressable>
    )
}

function SellerDetailsSkeleton() {
    const styles = useStyles()
    return (
        <>
            <View style={styles.sellerProfileCard}>
                <Skeleton width={56} height={56} radius={28} />
                <View style={styles.sellerProfileSkeletonText}>
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="40%" height={12} />
                </View>
            </View>
            <Skeleton height={120} radius={14} />
            <Skeleton height={120} radius={14} />
        </>
    )
}

export default function SellerDetails() {
    const styles = useStyles()
    const { theme } = useTheme()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const route = useRoute<SellerDetailsRouteProp>()
    const sellerId = route.params?.sellerId

    const [seller, setSeller] = useState<ISeller | null>(null)
    const [purchaseStats, setPurchaseStats] = useState<{ count: number; total: number } | null>(null)
    const [paymentStat, setPaymentStat] = useState<ISellerPaymentStat | null>(null)
    const [recentPurchases, setRecentPurchases] = useState<IPurchaseDetail[]>([])
    const [recentPayments, setRecentPayments] = useState<IPayment[]>([])
    const [paymentSheetVisible, setPaymentSheetVisible] = useState(false)
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
                const [found, stats, stat, history, paid] = await Promise.all([
                    sellerService.getSellerById(sellerId),
                    purchaseService.getSellerStats().catch(() => [] as { seller_id: number; purchase_count: number; total_spent: number }[]),
                    paymentService.getSellerPaymentStat(sellerId).catch(() => null),
                    purchaseService.getPurchasesBySeller(sellerId).catch(() => [] as IPurchaseDetail[]),
                    paymentService.getPaymentsBySeller(sellerId).catch(() => [] as IPayment[]),
                ])
                if (!found) {
                    setNotFound(true)
                    return
                }
                setNotFound(false)
                setSeller(found)
                const sellerStat = stats.find((s) => s.seller_id === sellerId)
                setPurchaseStats(
                    sellerStat
                        ? { count: sellerStat.purchase_count, total: sellerStat.total_spent }
                        : { count: 0, total: 0 },
                )
                setPaymentStat(stat)
                setRecentPurchases(history.slice(0, 3))
                setRecentPayments(paid.slice(0, 3))
            } catch (error) {
                showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC)
            }
        })
    }, [sellerId, withLoading])

    useEffect(() => {
        loadDetails()
    }, [loadDetails])

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
                    <SellerBackRow onBack={() => navigation.goBack()} />
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
                <SellerBackRow onBack={() => navigation.goBack()} />

                {seller && (
                    <SellerProfileHeader
                        seller={seller}
                        description={headerDescription}
                        onDelete={() => confirmDelete(seller.id)}
                    />
                )}

                {seller ? (
                    <ScrollView
                        style={styles.fillContainer}
                        contentContainerStyle={styles.sellerScrollContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={loading} onRefresh={loadDetails} colors={[theme.colors.primary]} />
                        }
                    >
                        {purchaseStats && (
                            <PurchasesSection
                                count={purchaseStats.count}
                                total={purchaseStats.total}
                                onPress={() => navigation.navigate(ROUTES.SELLER_PURCHASES, { sellerId: seller.id })}
                            />
                        )}

                        {purchaseStats && (
                            <View style={styles.sellerSectionSpacer}>
                                <SectionHeader
                                    compact
                                    icon="time-outline"
                                    title={UI_TEXT.RECENT_PURCHASES}
                                    action={
                                        <ViewAllLink
                                            onPress={() => navigation.navigate(ROUTES.SELLER_PURCHASES, { sellerId: seller.id })}
                                        />
                                    }
                                />
                                {recentPurchases.length === 0 ? (
                                    <EmptyState
                                        compact
                                        icon="receipt-outline"
                                        title={UI_TEXT.EMPTY_PURCHASE_LIST}
                                        description={`No purchases recorded for ${seller.name} yet`}
                                    />
                                ) : (
                                    recentPurchases.map((purchase, index) => (
                                        <RecentPurchaseRow
                                            key={purchase.id}
                                            item={purchase}
                                            isLast={index === recentPurchases.length - 1}
                                        />
                                    ))
                                )}
                            </View>
                        )}

                        <View style={styles.sellerHistoryDivider} />

                        <PaymentsSection
                            stat={paymentStat}
                            onPress={() => navigation.navigate(ROUTES.SELLER_PAYMENTS, { sellerId: seller.id })}
                        />

                        <PrimaryButton
                            title={UI_TEXT.PAYMENT}
                            onPress={() => setPaymentSheetVisible(true)}
                            containerStyle={styles.recordPaymentButton}
                        />

                        {paymentStat && (
                            <View style={styles.sellerSectionSpacer}>
                                <SectionHeader
                                    compact
                                    icon="cash-outline"
                                    title={UI_TEXT.RECENT_PAYMENTS}
                                    action={
                                        <ViewAllLink
                                            onPress={() => navigation.navigate(ROUTES.SELLER_PAYMENTS, { sellerId: seller.id })}
                                        />
                                    }
                                />
                                {recentPayments.length === 0 ? (
                                    <EmptyState
                                        compact
                                        icon="cash-outline"
                                        title={UI_TEXT.EMPTY_PAYMENT_LIST}
                                        description="Record a payment to settle this seller's balance"
                                    />
                                ) : (
                                    recentPayments.map((payment, index) => (
                                        <RecentPaymentRow
                                            key={payment.id}
                                            item={payment}
                                            isLast={index === recentPayments.length - 1}
                                        />
                                    ))
                                )}
                            </View>
                        )}
                    </ScrollView>
                ) : (
                    <SellerDetailsSkeleton />
                )}
            </View>

            {seller && (
                <PaymentFormSheet
                    visible={paymentSheetVisible}
                    sellerId={seller.id}
                    balance={paymentStat?.balance ?? 0}
                    onClose={() => setPaymentSheetVisible(false)}
                    onSaved={loadDetails}
                />
            )}
        </SafeAreaView>
    )
}

export const SELLER_DETAILS_ROUTE = ROUTES.SELLER_DETAILS
