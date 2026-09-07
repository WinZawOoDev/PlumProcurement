import { RefreshControl, ScrollView, Pressable, Text as RNText, View } from 'react-native'
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
import { IPurchaseDetail, IPayment, ISeller, ISellerPaymentStat } from '../../types/database'
import { formatDate } from '../../utils'
import { showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { IconButton, PrimaryButton } from '../../components/buttons/Button'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { CardSkeleton, Skeleton } from '../../components/Skeleton'
import PaymentFormSheet from './PaymentFormSheet'

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

function SellerStatsSection({ count, total, average }: { count: number; total: number; average: number }) {
    const styles = useStyles()
    return (
        <View style={styles.sellerStatsRow}>
            <StatCell label={UI_TEXT.PURCHASES_COUNT} value={String(count)} icon="receipt-outline" />
            <View style={styles.sellerStatDivider} />
            <StatCell label={UI_TEXT.TOTAL_VALUE} value={`${total.toFixed(2)}$`} icon="wallet-outline" />
            <View style={styles.sellerStatDivider} />
            <StatCell label={UI_TEXT.AVERAGE_VALUE} value={`${average.toFixed(2)}$`} icon="analytics-outline" />
        </View>
    )
}

function PaymentStatsSection({ stat }: { stat: ISellerPaymentStat }) {
    const styles = useStyles()
    return (
        <View style={styles.sellerStatsRow}>
            <StatCell label={UI_TEXT.OWED} value={`${stat.total_owed.toFixed(2)}$`} icon="cart-outline" />
            <View style={styles.sellerStatDivider} />
            <StatCell label={UI_TEXT.PAID} value={`${stat.total_paid.toFixed(2)}$`} icon="checkmark-circle-outline" />
            <View style={styles.sellerStatDivider} />
            <StatCell label={UI_TEXT.BALANCE} value={`${stat.balance.toFixed(2)}$`} icon="wallet-outline" />
        </View>
    )
}

function methodLabel(method: string | null): string {
    if (!method) return ''
    return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method
}

function PaymentRow({ item, onDelete }: { item: IPayment; onDelete: () => void }) {
    const styles = useStyles()
    const { theme } = useTheme()
    return (
        <View style={styles.purchaseItemRow}>
            <View style={styles.sellerInfo}>
                <RNText style={styles.purchaseItemTitle}>{item.amount.toFixed(2)}$</RNText>
                <RNText style={styles.purchaseItemSubtitle}>
                    {formatDate(item.paid_at)}
                    {item.method ? ` · ${methodLabel(item.method)}` : ''}
                    {item.note ? ` · ${item.note}` : ''}
                </RNText>
            </View>
            <IconButton
                icon={<Ionicons name="trash-outline" size={18} color={theme.colors.error} />}
                variant="ghost"
                onPress={onDelete}
                accessibilityLabel={A11Y_LABELS.DELETE_PAYMENT}
            />
        </View>
    )
}

function SellerPurchaseRow({ item }: { item: IPurchaseDetail }) {
    const styles = useStyles()
    const lines = item.items.length > 0 ? item.items : []
    return (
        <View style={styles.purchaseItemRow}>
            <View style={styles.sellerInfo}>
                <RNText style={styles.purchaseItemTitle}>
                    {formatDate(item.created_at)}
                </RNText>
                {lines.map((line) => (
                    <RNText key={line.id} style={styles.purchaseItemSubtitle}>
                        {line.category} × {line.quantity} ({line.unit}) @ {line.unit_price.toFixed(2)}$
                    </RNText>
                ))}
            </View>
            <RNText style={styles.purchaseItemTotal}>{item.total.toFixed(2)}$</RNText>
        </View>
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
    )
}

export default function SellerDetails() {
    const styles = useStyles()
    const { theme } = useTheme()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const route = useRoute<SellerDetailsRouteProp>()
    const sellerId = route.params?.sellerId

    const [seller, setSeller] = useState<ISeller | null>(null)
    const [purchases, setPurchases] = useState<IPurchaseDetail[]>([])
    const [paymentStat, setPaymentStat] = useState<ISellerPaymentStat | null>(null)
    const [payments, setPayments] = useState<IPayment[]>([])
    const [notFound, setNotFound] = useState(false)
    const [paymentSheetVisible, setPaymentSheetVisible] = useState(false)
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
                const [found, history, stat, paid] = await Promise.all([
                    sellerService.getSellerById(sellerId),
                    purchaseService.getPurchasesBySeller(sellerId).catch(() => [] as IPurchaseDetail[]),
                    paymentService.getSellerPaymentStat(sellerId).catch(() => null),
                    paymentService.getPaymentsBySeller(sellerId).catch(() => [] as IPayment[]),
                ])
                if (!found) {
                    setNotFound(true)
                    return
                }
                setNotFound(false)
                setSeller(found)
                setPurchases(history)
                setPaymentStat(stat)
                setPayments(paid)
            } catch (error) {
                showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC)
            }
        })
    }, [sellerId, withLoading])

    const confirmDeletePayment = useConfirmDelete<[number]>({
        remove: (id) => paymentService.removePayment(id),
        confirmMessage: 'Delete this payment? This cannot be undone.',
        successMessage: MESSAGES.PAYMENT_DELETE_SUCCESS,
        onDeleted: loadDetails,
    })

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

                {seller ? (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={loading} onRefresh={loadDetails} colors={[theme.colors.primary]} />
                        }
                    >
                        <SellerProfileHeader
                            seller={seller}
                            description={headerDescription}
                            onDelete={() => confirmDelete(seller.id)}
                        />

                        <SellerStatsSection count={purchases.length} total={total} average={average} />

                        <View style={styles.sellerSectionSpacer}>
                            <SectionHeader
                                icon="wallet-outline"
                                title={UI_TEXT.PAYMENT_HISTORY}
                                description={
                                    paymentStat && paymentStat.balance > 0
                                        ? `${UI_TEXT.BALANCE}: ${paymentStat.balance.toFixed(2)}$`
                                        : undefined
                                }
                            />
                        </View>

                        {paymentStat && <PaymentStatsSection stat={paymentStat} />}

                        <PrimaryButton
                            title={UI_TEXT.RECORD_PAYMENT}
                            onPress={() => setPaymentSheetVisible(true)}
                            containerStyle={styles.recordPaymentButton}
                        />

                        {payments.length === 0 ? (
                            <EmptyState
                                icon="cash-outline"
                                title={UI_TEXT.EMPTY_PAYMENT_LIST}
                                description="Record a payment to settle this seller's balance"
                            />
                        ) : (
                            payments.map((payment) => (
                                <PaymentRow
                                    key={payment.id}
                                    item={payment}
                                    onDelete={() => confirmDeletePayment(payment.id)}
                                />
                            ))
                        )}

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

                        {purchases.length === 0 ? (
                            <EmptyState
                                icon="receipt-outline"
                                title={UI_TEXT.EMPTY_PURCHASE_LIST}
                                description={`No purchases recorded for ${seller.name} yet`}
                            />
                        ) : (
                            purchases.slice(0, 20).map((purchase) => (
                                <SellerPurchaseRow key={purchase.id} item={purchase} />
                            ))
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
