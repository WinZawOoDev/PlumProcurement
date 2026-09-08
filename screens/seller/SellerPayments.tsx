import { RefreshControl, ScrollView, Text as RNText, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'
import { A11Y_LABELS, MESSAGES, SAFE_AREA, UI_TEXT, PAYMENT_METHODS } from '../../constants'
import { paymentService } from '../../services/paymentService'
import { IPayment, ISellerPaymentStat } from '../../types/database'
import { formatDate } from '../../utils'
import { showError } from '../../utils/notifications'
import { useLoading } from '../../hooks/useAsync'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { CardSkeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { IconButton } from '../../components/buttons/Button'
import { StatCell } from '../../components/StatCell'

type SellerPaymentsRouteProp = RouteProp<Record<string, { sellerId: number }>, string>

function methodLabel(method: string | null): string {
    if (!method) return ''
    return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method
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

export default function SellerPayments() {
    const styles = useStyles()
    const { theme } = useTheme()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const route = useRoute<SellerPaymentsRouteProp>()
    const sellerId = route.params?.sellerId

    const [paymentStat, setPaymentStat] = useState<ISellerPaymentStat | null>(null)
    const [payments, setPayments] = useState<IPayment[]>([])
    const { loading, withLoading } = useLoading(false)

    const loadPayments = useCallback(async () => {
        if (sellerId === undefined || sellerId === null) {
            return
        }
        await withLoading(async () => {
            try {
                const [stat, paid] = await Promise.all([
                    paymentService.getSellerPaymentStat(sellerId).catch(() => null),
                    paymentService.getPaymentsBySeller(sellerId).catch(() => [] as IPayment[]),
                ])
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
        onDeleted: loadPayments,
    })

    React.useEffect(() => {
        loadPayments()
    }, [loadPayments])

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
                    <RNText style={styles.sellerDetailsBackTitle}>{UI_TEXT.PAYMENT_HISTORY}</RNText>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={loadPayments}
                            colors={[theme.colors.primary]}
                        />
                    }
                >
                    {loading && payments.length === 0 && !paymentStat ? (
                        <>
                            <CardSkeleton />
                            <CardSkeleton />
                        </>
                    ) : (
                        <>
                            {paymentStat && <PaymentStatsSection stat={paymentStat} />}

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
                        </>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}
