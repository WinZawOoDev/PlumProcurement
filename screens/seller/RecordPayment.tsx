import { Pressable, Text as RNText, TextInput, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Controller, useForm } from 'react-hook-form'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useTheme } from '@rneui/themed'
import { useStyles } from '../../styles'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { SectionHeader } from '../../components/SectionHeader'
import { EmptyState } from '../../components/EmptyState'
import { KeyboardAvoid } from '../../components/KeyboardAvoid'
import { AMOUNT_PATTERN, ROUTES, SAFE_AREA } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { showError } from '../../utils/notifications'
import { formatNumber, toWesternDigits } from '../../utils'

type FormData = {
    amount: string
    method: string
    note: string
}

type RecordPaymentRouteProp = RouteProp<
    Record<string, { sellerId: number; sellerName?: string | null; sellerPhone?: string | null; balance?: number }>,
    typeof ROUTES.RECORD_PAYMENT
>

export default function RecordPayment() {
    const styles = useStyles()
    const { theme } = useTheme()
    const { UI_TEXT, MESSAGES, VALIDATION_MESSAGES, PAYMENT_METHODS, CURRENCY } = useLocalizedConstants()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const route = useRoute<RecordPaymentRouteProp>()
    const { sellerId, sellerName, sellerPhone, balance = 0 } = route.params ?? {}

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: { amount: '', method: '', note: '' },
        mode: 'onBlur',
    })

    const handleContinue = (data: FormData) => {
        const amount = parseFloat(data.amount)
        if (!AMOUNT_PATTERN.test(data.amount.trim()) || amount <= 0) {
            showError(MESSAGES.ERROR_INVALID_AMOUNT)
            return
        }
        navigation.navigate(ROUTES.PAYMENT_REVIEW, {
            sellerId,
            sellerName: sellerName ?? null,
            balance,
            amount,
            method: data.method || null,
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
                <View style={[styles.purchaseHistoryContainer, styles.fillContainer]}>
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
                    <View style={styles.paymentFormBody}>
                        <View style={styles.paymentBalanceRow}>
                            <RNText style={styles.paymentBalanceLabel}>
                                {UI_TEXT.OUTSTANDING_BALANCE}
                            </RNText>
                            <RNText style={styles.paymentBalanceValue}>
                                {formatNumber(balance)}{CURRENCY}
                            </RNText>
                        </View>

                        <View style={styles.paymentField}>
                            <RNText style={styles.paymentFieldLabel}>{UI_TEXT.AMOUNT}</RNText>
                            <Controller
                                control={control}
                                name="amount"
                                rules={{ required: VALIDATION_MESSAGES.AMOUNT_REQUIRED }}
                                render={({ field: { onChange, value, onBlur } }) => (
                                    <TextInput
                                        style={styles.paymentInput}
                                        value={value}
                                        onChangeText={(text) => onChange(toWesternDigits(text))}
                                        onBlur={onBlur}
                                        keyboardType="decimal-pad"
                                        placeholder={UI_TEXT.AMOUNT_PLACEHOLDER}
                                        placeholderTextColor={theme.colors.grey3}
                                        accessibilityLabel={UI_TEXT.AMOUNT}
                                    />
                                )}
                            />
                            {!!errors.amount && (
                                <RNText style={styles.paymentFormError}>{errors.amount.message}</RNText>
                            )}
                            {balance > 0 && (
                                <Pressable
                                    style={styles.settleFullBalance}
                                    onPress={() => setValue('amount', String(balance))}
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
                            <RNText style={styles.paymentFieldLabel}>{UI_TEXT.PAYMENT_METHOD}</RNText>
                            <Controller
                                control={control}
                                name="method"
                                render={({ field: { onChange, value } }) => (
                                    <View style={styles.paymentMethodChips}>
                                        {PAYMENT_METHODS.map((option) => {
                                            const selected = value === option.value
                                            return (
                                                <Pressable
                                                    key={option.value}
                                                    style={[
                                                        styles.paymentMethodChip,
                                                        selected && styles.paymentMethodChipActive,
                                                    ]}
                                                    onPress={() => onChange(option.value)}
                                                    accessibilityRole="button"
                                                    accessibilityState={{ selected }}
                                                    accessibilityLabel={option.label}
                                                >
                                                    <RNText
                                                        style={[
                                                            styles.paymentMethodChipText,
                                                            selected && styles.paymentMethodChipTextActive,
                                                        ]}
                                                    >
                                                        {option.label}
                                                    </RNText>
                                                </Pressable>
                                            )
                                        })}
                                    </View>
                                )}
                            />
                        </View>

                        <View style={styles.paymentField}>
                            <RNText style={styles.paymentFieldLabel}>{UI_TEXT.NOTE}</RNText>
                            <Controller
                                control={control}
                                name="note"
                                render={({ field: { onChange, value, onBlur } }) => (
                                    <TextInput
                                        style={styles.paymentInput}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        placeholder={UI_TEXT.OPTIONAL_NOTE_PLACEHOLDER}
                                        placeholderTextColor={theme.colors.grey3}
                                        accessibilityLabel={UI_TEXT.NOTE}
                                    />
                                )}
                            />
                        </View>
                    </View>
                    <View style={styles.editPurchaseFooter}>
                        <PrimaryButton title={UI_TEXT.CONTINUE} onPress={handleSubmit(handleContinue)} />
                        <SecondaryButton title={UI_TEXT.CANCEL} onPress={() => navigation.goBack()} />
                    </View>
                </View>
            </KeyboardAvoid>
        </SafeAreaView>
    )
}
