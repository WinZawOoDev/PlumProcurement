import { Pressable, ScrollView, Text as RNText, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useForm } from 'react-hook-form'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useTheme } from '@rneui/themed'
import { useStyles } from '../../styles'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { FormButtonGroupField, FormInputField } from '../../components/forms/FormFields'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { KeyboardAvoid } from '../../components/KeyboardAvoid'
import { MoneyText } from '../../components/MoneyText'
import { AMOUNT_PATTERN, ROUTES, SAFE_AREA } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { exceedsBalance, isPositiveAmount } from './paymentAmount'
import { useOrientation } from '../../hooks/useOrientation'

type FormData = {
    amount: string
    /** Index into PAYMENT_METHODS (FormButtonGroupField stores indexes); null = none chosen. */
    method: number | null
    note: string
}

type RecordPaymentRouteProp = RouteProp<
    Record<string, { sellerId: number; sellerName?: string | null; sellerPhone?: string | null; balance?: number }>,
    typeof ROUTES.RECORD_PAYMENT
>

export default function RecordPayment() {
    const styles = useStyles()
    const { theme } = useTheme()
    const { UI_TEXT, MESSAGES, VALIDATION_MESSAGES, PAYMENT_METHODS } = useLocalizedConstants()
    const { isLandscape } = useOrientation()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const route = useRoute<RecordPaymentRouteProp>()
    const { sellerId, sellerName, sellerPhone, balance = 0 } = route.params ?? {}

    const { control, handleSubmit, setValue, setError } = useForm<FormData>({
        defaultValues: { amount: '', method: null, note: '' },
        mode: 'onBlur',
    })

    const handleContinue = (data: FormData) => {
        const amountText = data.amount.trim()
        const amount = parseFloat(amountText)
        if (!AMOUNT_PATTERN.test(amountText) || !isPositiveAmount(amount)) {
            setError('amount', { type: 'validate', message: MESSAGES.ERROR_INVALID_AMOUNT })
            return
        }
        if (exceedsBalance(amount, balance)) {
            setError('amount', { type: 'validate', message: MESSAGES.ERROR_PAYMENT_EXCEEDS_BALANCE })
            return
        }
        const method = data.method === null ? undefined : PAYMENT_METHODS[data.method]
        navigation.navigate(ROUTES.PAYMENT_REVIEW, {
            sellerId,
            sellerName: sellerName ?? null,
            balance,
            amount,
            method: method?.value ?? null,
            note: data.note.trim() || null,
        })
    }

    if (sellerId === undefined) {
        return (
            <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.purchaseHistoryScreen}>
                <EmptyState
                    icon="cash-outline"
                    title={UI_TEXT.EMPTY_PAYMENT_LIST}
                    description={UI_TEXT.PAYMENT_SETTLE_HINT}
                />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView edges={SAFE_AREA.EDGES} style={styles.purchaseHistoryScreen}>
            <KeyboardAvoid style={styles.fillContainer}>
                <View
                    style={[
                        styles.purchaseHistoryContainer,
                        styles.fillContainer,
                        styles.responsiveContent,
                        isLandscape && styles.responsiveContentLandscape,
                    ]}
                >
                    <SectionHeader
                        onBack={() => navigation.goBack()}
                        title={UI_TEXT.RECORD_PAYMENT}
                        description={
                            sellerName ? (
                                <>
                                    <RNText style={styles.sectionHeaderContactText}>{sellerName}</RNText>
                                    {!!sellerPhone?.trim() && (
                                        <View style={styles.sectionHeaderContactRow}>
                                            <Ionicons
                                                name="call-outline"
                                                size={14}
                                                color={theme.colors.grey4}
                                            />
                                            <RNText style={styles.sectionHeaderContactText}>
                                                {sellerPhone.trim()}
                                            </RNText>
                                        </View>
                                    )}
                                </>
                            ) : (
                                UI_TEXT.RECORD_PAYMENT_DESCRIPTION
                            )
                        }
                    />
                    <ScrollView
                        style={styles.paymentFormScroll}
                        contentContainerStyle={styles.paymentFormScrollContent}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.paymentBalanceRow}>
                            <RNText style={styles.paymentBalanceLabel}>
                                {UI_TEXT.OUTSTANDING_BALANCE}
                            </RNText>
                            <MoneyText amount={balance} valueStyle={styles.paymentBalanceValue} />
                        </View>

                        <View style={styles.paymentField}>
                            <FormInputField
                                name="amount"
                                control={control}
                                label={UI_TEXT.AMOUNT}
                                placeholder={UI_TEXT.AMOUNT_PLACEHOLDER}
                                keyboardType="decimal-pad"
                                required
                                rules={{ required: VALIDATION_MESSAGES.AMOUNT_REQUIRED }}
                                testID="payment-amount-input"
                            />
                            {balance > 0 && (
                                <Pressable
                                    style={styles.settleFullBalance}
                                    onPress={() => setValue('amount', String(balance))}
                                    testID="settle-full-balance"
                                    accessibilityRole="button"
                                    accessibilityLabel={UI_TEXT.SETTLE_FULL_BALANCE}
                                >
                                    <Ionicons
                                        name="checkmark-circle-outline"
                                        size={14}
                                        color={theme.colors.primary}
                                    />
                                    <RNText style={styles.settleFullBalanceText}>
                                        {UI_TEXT.SETTLE_FULL_BALANCE}
                                    </RNText>
                                </Pressable>
                            )}
                        </View>

                        <View style={styles.paymentField}>
                            <FormButtonGroupField
                                name="method"
                                control={control}
                                label={UI_TEXT.PAYMENT_METHOD}
                                buttons={PAYMENT_METHODS.map((option) => option.label)}
                            />
                        </View>

                        <View style={styles.paymentField}>
                            <FormInputField
                                name="note"
                                control={control}
                                label={UI_TEXT.NOTE}
                                placeholder={UI_TEXT.OPTIONAL_NOTE_PLACEHOLDER}
                            />
                        </View>
                    </ScrollView>
                    <View style={[styles.editPurchaseFooter, isLandscape && styles.responsiveActionsRow]}>
                        <View style={[isLandscape && styles.responsiveActionsRowItem]}>
                            <PrimaryButton title={UI_TEXT.CONTINUE} onPress={handleSubmit(handleContinue)} testID="btn-Continue" />
                        </View>
                        <View style={[isLandscape && styles.responsiveActionsRowItem]}>
                            <SecondaryButton title={UI_TEXT.CANCEL} onPress={() => navigation.goBack()} />
                        </View>
                    </View>
                </View>
            </KeyboardAvoid>
        </SafeAreaView>
    )
}
