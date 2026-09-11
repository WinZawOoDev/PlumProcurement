import { View, Text as RNText } from 'react-native'
import React, { useEffect } from 'react'
import { BottomSheet, Text } from '@rneui/themed'
import { useForm } from 'react-hook-form'
import { useStyles } from '../../styles'
import { FormInputField, FormSelectField } from '../../components/forms/FormFields'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { AMOUNT_PATTERN } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { paymentService } from '../../services/paymentService'
import { showSuccess, showError } from '../../utils/notifications'
import { formatNumber } from '../../utils'

type FormData = {
    amount: string
    method: string
    note: string
}

interface PaymentFormSheetProps {
    visible: boolean
    sellerId: number
    balance: number
    onClose: () => void
    onSaved: () => void
}

export default function PaymentFormSheet({ visible, sellerId, balance, onClose, onSaved }: PaymentFormSheetProps) {
    const styles = useStyles()
    const { UI_TEXT, MESSAGES, VALIDATION_MESSAGES, PAYMENT_METHODS, CURRENCY } = useLocalizedConstants()

    const { control, handleSubmit, reset, formState } = useForm<FormData>({
        defaultValues: { amount: '', method: '', note: '' },
        mode: 'onBlur',
    })

    useEffect(() => {
        if (visible) {
            reset({ amount: '', method: '', note: '' })
        }
    }, [visible, reset])

    const handleSave = async (data: FormData) => {
        const amount = parseFloat(data.amount)
        if (!AMOUNT_PATTERN.test(data.amount.trim()) || amount <= 0) {
            showError(MESSAGES.ERROR_INVALID_AMOUNT)
            return
        }
        try {
            await paymentService.recordPayment({
                seller_id: sellerId,
                purchase_id: null,
                amount,
                method: data.method || null,
                note: data.note.trim() || null,
            })
            showSuccess(MESSAGES.PAYMENT_RECORDED_SUCCESS)
            onSaved()
            onClose()
        } catch (error) {
            showError((error as Error)?.message ?? MESSAGES.ERROR_GENERIC)
        }
    }

    return (
        <BottomSheet isVisible={visible} onBackdropPress={onClose} modalProps={{ animationType: 'slide' }}>
            <View style={styles.bottomSheetContainer}>
                <Text style={styles.bottomSheetTitle}>{UI_TEXT.RECORD_PAYMENT}</Text>
                <RNText style={styles.purchaseItemSubtitle}>
                    {UI_TEXT.OUTSTANDING_BALANCE}: {formatNumber(balance)}{CURRENCY}
                </RNText>
                <FormInputField
                    name="amount"
                    control={control}
                    label={UI_TEXT.AMOUNT}
                    placeholder={UI_TEXT.AMOUNT_PLACEHOLDER}
                    keyboardType="decimal-pad"
                    required
                    rules={{ required: VALIDATION_MESSAGES.AMOUNT_REQUIRED }}
                />
                <FormSelectField
                    name="method"
                    control={control}
                    label={UI_TEXT.PAYMENT_METHOD}
                    options={[...PAYMENT_METHODS]}
                    placeholder={UI_TEXT.SELECT_METHOD_PLACEHOLDER}
                />
                <FormInputField
                    name="note"
                    control={control}
                    label={UI_TEXT.NOTE}
                    placeholder={UI_TEXT.OPTIONAL_NOTE_PLACEHOLDER}
                    keyboardType="default"
                />
                <View style={styles.formActions}>
                    <PrimaryButton
                        title={UI_TEXT.SAVE}
                        disabled={formState.isSubmitting}
                        loading={formState.isSubmitting}
                        onPress={handleSubmit(handleSave)}
                    />
                    <SecondaryButton title={UI_TEXT.CANCEL} onPress={onClose} />
                </View>
            </View>
        </BottomSheet>
    )
}
