import { ScrollView, Text as RNText, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStyles } from '../../styles'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { ROUTES, SAFE_AREA } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { paymentService } from '../../services/paymentService'
import { purchaseService } from '../../services/purchaseService'
import { IPurchaseDetail } from '../../types/database'
import { showSuccess, showError } from '../../utils/notifications'
import { formatDateDisplay, formatNumber } from '../../utils'
import { useLoading } from '../../hooks/useAsync'

type PaymentReviewRouteProp = RouteProp<
    Record<
        string,
        {
            sellerId: number
            sellerName: string | null
            balance: number
            amount: number
            method: string | null
            note: string | null
        }
    >,
    typeof ROUTES.PAYMENT_REVIEW
>

function DetailRow({ label, value }: { label: string; value: string }) {
    const styles = useStyles()
    return (
        <View style={styles.purchaseSummaryRow}>
            <RNText style={styles.purchaseSummaryLabel}>{label}</RNText>
            <RNText style={styles.purchaseSummaryValue} numberOfLines={1}>
                {value}
            </RNText>
        </View>
    )
}

export default function PaymentReview() {
    const styles = useStyles()
    const { UI_TEXT, MESSAGES, PAYMENT_METHODS, CURRENCY } = useLocalizedConstants()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const route = useRoute<PaymentReviewRouteProp>()
    const { sellerId, sellerName, balance = 0, amount, method, note } = route.params ?? {}
    const { loading: saving, withLoading: withSaving } = useLoading(false)
    const [purchases, setPurchases] = useState<IPurchaseDetail[]>([])

    useEffect(() => {
        if (sellerId === undefined) return
        let cancelled = false
        purchaseService
            .getUnpaidPurchasesBySeller(sellerId)
            .then((items) => {
                if (!cancelled) setPurchases(items)
            })
            .catch(() => undefined)
        return () => {
            cancelled = true
        }
    }, [sellerId])

    if (sellerId === undefined || amount === undefined) {
        return (
            <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.purchaseHistoryScreen}>
                <EmptyState
                    icon="receipt-outline"
                    title={UI_TEXT.EMPTY_PAYMENT_LIST}
                    description={UI_TEXT.PAYMENT_SETTLE_HINT}
                />
            </SafeAreaView>
        )
    }

    const methodLabel = method
        ? PAYMENT_METHODS.find((option) => option.value === method)?.label ?? method
        : '—'
    const balanceAfter = Math.max(0, balance - amount)

    const handleProcess = async () => {
        await withSaving(async () => {
            try {
                await paymentService.recordPayment({
                    seller_id: sellerId,
                    purchase_id: null,
                    amount,
                    method,
                    note,
                })
                showSuccess(MESSAGES.PAYMENT_RECORDED_SUCCESS)
                // Land back on the seller details screen and refresh its stats.
                navigation.popTo(ROUTES.SELLER_DETAILS)
            } catch (error) {
                showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC)
            }
        })
    }

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.purchaseHistoryScreen}>
            <View style={[styles.purchaseHistoryContainer, styles.fillContainer]}>
                <SectionHeader
                    onBack={() => navigation.goBack()}
                    title={UI_TEXT.PAYMENT_REVIEW_TITLE}
                    description={UI_TEXT.PAYMENT_REVIEW_DESCRIPTION}
                />
                <ScrollView
                    style={styles.editPurchaseList}
                    contentContainerStyle={styles.editPurchaseItemsContent}
                    showsVerticalScrollIndicator
                    persistentScrollbar
                >
                    <View style={styles.purchaseSummaryCard}>
                        <View style={styles.purchaseSummaryHeroRow}>
                            <View style={styles.purchaseSummaryAvatar}>
                                <RNText style={styles.purchaseSummaryAvatarText}>
                                    {(sellerName ?? UI_TEXT.NO_SELLER).charAt(0).toUpperCase()}
                                </RNText>
                            </View>
                            <View style={styles.purchaseSummaryHeroText}>
                                <RNText style={styles.paymentHeroLabel}>
                                    {UI_TEXT.PAID_TO}
                                </RNText>
                                <RNText style={styles.purchaseSummarySellerName}>
                                    {sellerName ?? UI_TEXT.NO_SELLER}
                                </RNText>
                                <RNText style={styles.purchaseSummaryDateText}>
                                    {formatDateDisplay(new Date().toISOString())}
                                </RNText>
                            </View>
                        </View>
                    </View>

                    <View style={styles.paymentAmountCard}>
                        <RNText style={styles.paymentAmountLabel}>{UI_TEXT.AMOUNT}</RNText>
                        <View style={styles.paymentAmountRow}>
                            <RNText style={styles.paymentAmountHero}>{formatNumber(amount)}</RNText>
                            <RNText style={styles.paymentAmountCurrency}>{CURRENCY}</RNText>
                        </View>
                    </View>

                    <View style={styles.purchaseSummaryCard}>
                        <DetailRow label={UI_TEXT.PAYMENT_METHOD} value={methodLabel} />
                        <DetailRow label={UI_TEXT.NOTE} value={note ?? '—'} />
                        <View style={[styles.purchaseSummaryRow, styles.purchaseDetailsSummaryDivider]}>
                            <RNText style={styles.purchaseSummaryLabel}>
                                {UI_TEXT.OUTSTANDING_BALANCE}
                            </RNText>
                            <RNText style={styles.purchaseSummaryValue}>
                                {formatNumber(balance)}{CURRENCY}
                            </RNText>
                        </View>
                        <View style={styles.purchaseSummaryRow}>
                            <RNText style={styles.purchaseSummaryLabel}>
                                {UI_TEXT.BALANCE_AFTER_PAYMENT}
                            </RNText>
                            <RNText style={styles.purchaseTotalText}>
                                {formatNumber(balanceAfter)}{CURRENCY}
                            </RNText>
                        </View>

                        <View style={styles.paymentPurchasesBlock}>
                            <RNText style={styles.paymentPurchasesLabel}>
                                {UI_TEXT.PAYMENT_FOR_PURCHASES}
                            </RNText>
                            {purchases.length === 0 ? (
                                <RNText style={styles.paymentPurchaseEmpty}>—</RNText>
                            ) : (
                                purchases.map((purchase) => (
                                    <View key={purchase.id} style={styles.paymentPurchaseRow}>
                                        <RNText style={styles.paymentPurchaseDate}>
                                            {formatDateDisplay(purchase.created_at)}
                                        </RNText>
                                        <RNText style={styles.paymentPurchaseTotal}>
                                            {formatNumber(purchase.total)}{CURRENCY}
                                        </RNText>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>
                </ScrollView>
                <View style={styles.editPurchaseFooter}>
                    <PrimaryButton
                        title={UI_TEXT.PROCESS_PAYMENT}
                        disabled={saving}
                        loading={saving}
                        onPress={handleProcess}
                    />
                    <SecondaryButton title={UI_TEXT.EDIT} onPress={() => navigation.goBack()} />
                </View>
            </View>
        </SafeAreaView>
    )
}
