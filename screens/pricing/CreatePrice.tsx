import { View, KeyboardAvoidingView, Platform } from 'react-native'
import React from 'react'
import { Text } from '@rneui/themed'
import { Control, useForm } from 'react-hook-form'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStyles } from '../../styles'
import { DatabaseError } from '../../database/connection'
import { usePrices } from '../../context/PriceContext'
import { FormSelectField, FormInputField, FormButtonGroupField } from '../../components/forms/FormFields'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { FORM_CONFIG, UNIT_LIST, ROUTES, ANIMATIONS, PRICE_PATTERN } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { showSuccess, showError } from '../../utils/notifications'
import { useAsync } from '../../hooks/useAsync'

type FormData = {
    price: string
    unit: number
    category: string
}

function PriceFields({ control }: { control: Control<FormData> }) {
    const { UI_TEXT, VALIDATION_MESSAGES, CATEGORY_LIST, UNITS } = useLocalizedConstants()
    return (
        <>
            <FormSelectField
                name="category"
                control={control}
                label={UI_TEXT.CATEGORY}
                options={CATEGORY_LIST}
                required
                rules={{ required: VALIDATION_MESSAGES.CATEGORY_REQUIRED }}
            />

            <FormButtonGroupField
                name="unit"
                control={control}
                label={UI_TEXT.UNIT_SELECTION}
                buttons={UNIT_LIST.map((unit) => UNITS[unit] ?? unit)}
                required
                rules={{ required: VALIDATION_MESSAGES.UNIT_REQUIRED }}
            />

            <FormInputField
                name="price"
                control={control}
                label={UI_TEXT.PRICE}
                placeholder={FORM_CONFIG.PRICE_PLACEHOLDER}
                keyboardType={FORM_CONFIG.PRICE_KEYTYPE}
                required
                rules={{
                    required: VALIDATION_MESSAGES.PRICE_REQUIRED,
                    pattern: {
                        value: PRICE_PATTERN,
                        message: VALIDATION_MESSAGES.PRICE_INVALID,
                    },
                }}
            />
        </>
    )
}

function PriceActions({
    saving,
    onSubmit,
    onCancel,
}: {
    saving: boolean
    onSubmit: () => void
    onCancel: () => void
}) {
    const styles = useStyles()
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <View style={styles.createPriceActions}>
            <PrimaryButton
                title={UI_TEXT.SAVE_PRICE}
                disabled={saving}
                loading={saving}
                onPress={onSubmit}
            />
            <SecondaryButton
                title={UI_TEXT.CANCEL}
                disabled={saving}
                onPress={onCancel}
            />
        </View>
    )
}

export default function CreatePrice() {
    const styles = useStyles()
    const { MESSAGES } = useLocalizedConstants()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const { addPrice } = usePrices()
    const { loading: saving, execute } = useAsync()

    const { control, handleSubmit } = useForm<FormData>({
        defaultValues: {
            price: FORM_CONFIG.PRICE_DEFAULT,
            unit: FORM_CONFIG.UNIT_DEFAULT,
            category: FORM_CONFIG.CATEGORY_DEFAULT,
        },
        mode: 'onBlur',
    })

    const handleSavePrice = async (data: FormData) => {
        await execute(async () => {
            try {
                await addPrice({
                    category: data.category,
                    price: parseFloat(data.price),
                    unit: UNIT_LIST[data.unit],
                })
                showSuccess(MESSAGES.PRICE_SAVED_SUCCESS)
                navigation.popTo(ROUTES.PURCHASE_PRICE)
            } catch (error) {
                const message = error instanceof DatabaseError ? error.message : MESSAGES.ERROR_GENERIC
                showError(message)
                throw error
            }
        })
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? ANIMATIONS.KEYBOARD_AVOID_BEHAVIOR : 'height'}
            style={styles.createPriceContainer}
        >
            <PriceFields control={control} />
            <PriceActions
                saving={saving}
                onSubmit={handleSubmit(handleSavePrice)}
                onCancel={() => navigation.goBack()}
            />
        </KeyboardAvoidingView>
    )
}

export function CreatePriceHeaderTitle() {
    const styles = useStyles()
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <View>
            <Text style={styles.headerTitleText}>
                {UI_TEXT.PRICE_ENTRY}
            </Text>
        </View>
    )
}
