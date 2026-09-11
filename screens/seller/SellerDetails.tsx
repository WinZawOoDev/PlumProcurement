import { Pressable, RefreshControl, ScrollView, Text as RNText, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from '@rneui/themed'
import { useTranslation } from 'react-i18next'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { ROUTES, SAFE_AREA, PAGINATION_CONFIG } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
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
    const { UI_TEXT, A11Y_LABELS } = useLocalizedConstants()
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
    const { A11Y_LABELS } = useLocalizedConstants()
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
    const { UI_TEXT } = useLocalizedConstants()
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
    const { UI_TEXT } = useLocalizedConstants()
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
    const { UI_TEXT } = useLocalizedConstants()
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

function RecentPaymentRow({ item, isLast }: { item: IPayment; isLast?: boolean }) {
    const styles = useStyles()
    const { t } = useTranslation()
    return (
        <View style={[styles.purchaseItemRow, styles.sellerRecentRow, isLast && styles.sellerRecentRowLast]}>
            <View style={styles.sellerInfo}>
                <RNText style={styles.sellerRecentTitle}>{item.amount.toFixed(2)}$</RNText>
                <RNText style={styles.sellerRecentSubtitle}>
                    {formatDate(item.paid_at)}
                    {item.method ? ` · ${t(`paymentMethods.${item.method}`, { defaultValue: item.method })}` : ''}
                </RNText>
            </View>
        </View>
    )
}

function RecentPurchaseRow({ item, isLast }: { item: IPurchaseDetail; isLast?: boolean }) {
    const styles = useStyles()
    const { UI_TEXT } = useLocalizedConstants()
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

function SkeletonSectionHeader({ compact = false }: { compact?: boolean }) {
    const styles = useStyles()
    return (
        <View style={styles.sellerSkeletonSectionHeader}>
            <Skeleton width={compact ? 16 : 22} height={compact ? 16 : 22} radius={compact ? 8 : 11} />
            <Skeleton width={compact ? '35%' : '45%'} height={compact ? 14 : 18} />
            {compact && <Skeleton width={64} height={14} radius={7} style={styles.sellerSkeletonSectionAction} />}
        </View>
    )
}

function SkeletonStatsRow() {
    const styles = useStyles()
    return (
        <View style={styles.sellerStatsRow}>
            {[0, 1, 2].map((index) => (
                <React.Fragment key={index}>
                    {index > 0 && <View style={styles.sellerStatDivider} />}
                    <View style={styles.sellerStatCell}>
                        <View style={styles.sellerStatIconCircle}>
                            <Skeleton width={16} height={16} radius={4} />
                        </View>
                        <Skeleton width={56} height={15} radius={4} />
                        <Skeleton width={44} height={10} radius={5} />
                    </View>
                </React.Fragment>
            ))}
        </View>
    )
}

function SkeletonRecentRow({ isLast = false }: { isLast?: boolean }) {
    const styles = useStyles()
    return (
        <View style={[styles.purchaseItemRow, styles.sellerRecentRow, isLast && styles.sellerRecentRowLast]}>
            <View style={styles.sellerInfo}>
                <Skeleton width="55%" height={14} />
                <Skeleton width="35%" height={12} />
            </View>
            <Skeleton width={52} height={14} />
        </View>
    )
}

function SellerDetailsSkeleton() {
    const styles = useStyles()
    return (
        <ScrollView
            style={styles.fillContainer}
            contentContainerStyle={styles.sellerScrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.sellerProfileCard}>
                <Skeleton width={56} height={56} radius={28} />
                <View style={styles.sellerProfileSkeletonText}>
                    <Skeleton width="55%" height={18} />
                    <View style={styles.sellerProfileMetaRow}>
                        <Skeleton width={12} height={12} radius={6} />
                        <Skeleton width="40%" height={12} radius={6} />
                    </View>
                </View>
            </View>

            <SkeletonSectionHeader />
            <SkeletonStatsRow />

            <View style={styles.sellerSectionSpacer}>
                <SkeletonSectionHeader compact />
                <SkeletonRecentRow />
                <SkeletonRecentRow />
                <SkeletonRecentRow isLast />
            </View>

            <View style={styles.sellerHistoryDivider} />

            <SkeletonSectionHeader />
            <SkeletonStatsRow />

            <View style={styles.recordPaymentButton}>
                <Skeleton height={50} radius={10} />
            </View>

            <View style={styles.sellerSectionSpacer}>
                <SkeletonSectionHeader compact />
                <SkeletonRecentRow />
                <SkeletonRecentRow isLast />
            </View>
        </ScrollView>
    )
}

export default function SellerDetails() {
    const styles = useStyles()
    const { theme } = useTheme()
    const { t } = useTranslation()
    const { UI_TEXT, MESSAGES } = useLocalizedConstants()
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
                    purchaseService.getRecentPurchasesBySeller(sellerId, PAGINATION_CONFIG.RECENT_SELLER_ITEMS_LIMIT).catch(() => [] as IPurchaseDetail[]),
                    paymentService.getRecentPaymentsBySeller(sellerId, PAGINATION_CONFIG.RECENT_SELLER_ITEMS_LIMIT).catch(() => [] as IPayment[]),
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
                setRecentPurchases(history)
                setRecentPayments(paid)
            } catch (error) {
                showError((error as Error)?.message ?? t('messages.ERROR_GENERIC'))
            }
        })
    }, [sellerId, withLoading, t])

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
                        description={UI_TEXT.SELLER_NOT_FOUND}
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
                                        description={t('uiText.SELLER_NO_PURCHASES', { name: seller.name })}
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
                                        description={UI_TEXT.PAYMENT_SETTLE_HINT}
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
