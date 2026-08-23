import { View, KeyboardAvoidingView, Platform, ToastAndroid } from 'react-native'
import React, { useState } from 'react'
import { Text, useTheme } from '@rneui/themed'
import { useForm } from 'react-hook-form'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStyles } from '../../styles'
import { DatabaseError } from '../../database'
import { usePrices } from '../../context/PriceContext'
import { FormSelectField, FormInputField, FormCheckboxField, FormButtonGroupField } from '../../components/forms/FormFields'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { FORM_CONFIG, CATEGORY_LIST, UNIT_LIST, MESSAGES, UI_TEXT, ROUTES, ANIMATIONS, VALIDATION_MESSAGES, PRICE_PATTERN } from '../../constants'

type FormData = {
    price: string
    unit: number
    category: string
    isAvailable: boolean
}

export default function CreatePrice() {
    const styles = useStyles()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const { addPrice } = usePrices()
    const [saving, setSaving] = useState(false)

    const { control, handleSubmit } = useForm<FormData>({
        defaultValues: {
            price: FORM_CONFIG.PRICE_DEFAULT,
            unit: FORM_CONFIG.UNIT_DEFAULT,
            category: FORM_CONFIG.CATEGORY_DEFAULT,
            isAvailable: FORM_CONFIG.AVAILABLE_DEFAULT,
        },
        mode: 'onBlur',
    })

    const handleSavePrice = async (data: FormData) => {
        setSaving(true)
        try {
            await addPrice({
                category: data.category,
                price: parseFloat(data.price),
                unit: UNIT_LIST[data.unit],
                is_available: data.isAvailable,
            })
            ToastAndroid.show(MESSAGES.PRICE_SAVED_SUCCESS, ToastAndroid.SHORT)
            navigation.popTo(ROUTES.PURCHASE_PRICE)
        } catch (error) {
            const message = error instanceof DatabaseError ? error.message : MESSAGES.ERROR_GENERIC
            ToastAndroid.show(message, ToastAndroid.LONG)
        } finally {
            setSaving(false)
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? ANIMATIONS.KEYBOARD_AVOID_BEHAVIOR : 'height'}
            style={styles.createPriceContainer}
        >
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
                buttons={UNIT_LIST}
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

            <FormCheckboxField
                name="isAvailable"
                control={control}
                label={UI_TEXT.AVAILABLE}
            />

            <View style={{ marginTop: 30, width: '100%', paddingHorizontal: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <PrimaryButton
                    title={UI_TEXT.SAVE_PRICE}
                    disabled={saving}
                    loading={saving}
                    onPress={handleSubmit(handleSavePrice)}
                />
                <SecondaryButton
                    title={UI_TEXT.CANCEL}
                    disabled={saving}
                    onPress={() => navigation.goBack()}
                />
            </View>
        </KeyboardAvoidingView>
    )
}

export function CreatePriceHeaderTitle() {
    const { theme } = useTheme()
    return (
        <View>
            <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 20, fontFamily: 'Manrope', letterSpacing: 0.5 }}>
                Price Entry
            </Text>
        </View>
    )
}
