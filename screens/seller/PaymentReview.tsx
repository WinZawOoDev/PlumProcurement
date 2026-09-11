import { Alert, ScrollView, Text as RNText, View } from 'react-native'
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

function DashedDivider() {
    const styles = useStyles()
    return (
        <View style={styles.paymentSlipDashes}>
            {Array.from({ length: 22 }).map((_, index) => (
                <View key={index} style={styles.paymentSlipDash} />
            ))}
        </View>
    )
}

function SlipRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
    const styles = useStyles()
    return (
        <View style={styles.paymentSlipRow}>
            <RNText style={styles.paymentSlipRowLabel}>{label}</RNText>
            <RNText
                style={strong ? styles.paymentSlipRowValueStrong : styles.paymentSlipRowValue}
                numberOfLines={1}
            >
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
            .getUnpaidPurchasesBySeller(sellerId, 20)
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

    const performProcess = async () => {
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
                // popTo replaces the target's params, so pass sellerId back or
                // SellerDetails loses it and renders "seller not found".
                navigation.popTo(ROUTES.SELLER_DETAILS, { sellerId })
            } catch (error) {
                showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC)
            }
        })
    }

    const handleProcess = () => {
        Alert.alert(UI_TEXT.PAYMENT_CONFIRM_TITLE, UI_TEXT.PAYMENT_CONFIRM_MESSAGE, [
            { text: UI_TEXT.CANCEL, style: 'cancel' },
            { text: UI_TEXT.CONFIRM, onPress: performProcess },
        ])
    }

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.purchaseHistoryScreen}>
            <View style={[styles.purchaseHistoryContainer, styles.fillContainer]}>
                <SectionHeader
                    onBack={() => navigation.goBack()}
                    title={UI_TEXT.PAYMENT_REVIEW_TITLE}
                    description={UI_TEXT.PAYMENT_REVIEW_DESCRIPTION}
                />
                <View style={styles.paymentFormBody}>
                    <View style={styles.paymentSlip}>
                        <RNText style={styles.paymentSlipEyebrow}>{UI_TEXT.PAYMENT}</RNText>
                        <RNText style={styles.paymentSlipSeller}>
                            {sellerName ?? UI_TEXT.NO_SELLER}
                        </RNText>
                        <RNText style={styles.paymentSlipDate}>
                            {formatDateDisplay(new Date().toISOString())}
                        </RNText>

                        <DashedDivider />

                        <View style={styles.paymentSlipAmountBlock}>
                            <RNText style={styles.paymentSlipAmountLabel}>{UI_TEXT.AMOUNT}</RNText>
                            <View style={styles.paymentSlipAmountRow}>
                                <RNText style={styles.paymentSlipAmount}>{formatNumber(amount)}</RNText>
                                <RNText style={styles.paymentSlipAmountCurrency}>{CURRENCY}</RNText>
                            </View>
                        </View>

                        <SlipRow label={UI_TEXT.PAYMENT_METHOD} value={methodLabel} />
                        <SlipRow label={UI_TEXT.NOTE} value={note ?? '—'} />

                        <DashedDivider />

                        <SlipRow
                            label={UI_TEXT.OUTSTANDING_BALANCE}
                            value={`${formatNumber(balance)}${CURRENCY}`}
                        />
                        <SlipRow
                            label={UI_TEXT.BALANCE_AFTER_PAYMENT}
                            value={`${formatNumber(balanceAfter)}${CURRENCY}`}
                            strong
                        />

                        <DashedDivider />

                        <View style={styles.paymentPurchasesBlock}>
                            <RNText style={styles.paymentPurchasesLabel}>
                                {UI_TEXT.PAYMENT_FOR_PURCHASES}
                            </RNText>
                            {purchases.length === 0 ? (
                                <RNText style={styles.paymentPurchaseEmpty}>—</RNText>
                            ) : (
                                <ScrollView
                                    style={styles.paymentPurchasesScroll}
                                    showsVerticalScrollIndicator
                                    persistentScrollbar
                                    nestedScrollEnabled
                                >
                                    {purchases.map((purchase) => (
                                        <View key={purchase.id} style={styles.paymentPurchaseRow}>
                                            <RNText style={styles.paymentPurchaseDate}>
                                                {formatDateDisplay(purchase.created_at)}
                                            </RNText>
                                            <RNText style={styles.paymentPurchaseTotal}>
                                                {formatNumber(purchase.total)}{CURRENCY}
                                            </RNText>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </View>
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
