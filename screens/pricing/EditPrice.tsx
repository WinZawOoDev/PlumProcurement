import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { BottomSheet } from '@rneui/themed'
import { useForm } from 'react-hook-form'
import { useStyles } from '../../styles'
import {
    FormInputField,
    FormSelectField,
    FormCheckboxField,
    FormButtonGroupField,
} from '../../components/forms/FormFields'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import {
    UI_TEXT,
    MESSAGES,
    VALIDATION_MESSAGES,
    PRICE_PATTERN,
    FORM_CONFIG,
    CATEGORY_LIST,
    UNIT_LIST,
} from '../../constants'
import { usePrices } from '../../context/PriceContext'
import { IPrice } from '../../types/database'
import { showSuccess, showError } from '../../utils/notifications'

type FormData = {
    id: number
    price: string
    unit: number
    category: string
    isAvailable: boolean
}

interface EditPriceProps {
    visible: boolean
    price: IPrice | null
    onClose: () => void
}

export default function EditPrice({ visible, price, onClose }: EditPriceProps) {
    const styles = useStyles()
    const { editPrice } = usePrices()

    const { control, handleSubmit, reset, formState } = useForm<FormData>({
        defaultValues: {
            id: 0,
            price: FORM_CONFIG.PRICE_DEFAULT,
            unit: FORM_CONFIG.UNIT_DEFAULT,
            category: FORM_CONFIG.CATEGORY_DEFAULT,
            isAvailable: FORM_CONFIG.AVAILABLE_DEFAULT,
        },
        mode: 'onBlur',
    })

    useEffect(() => {
        if (price && visible) {
            const unitIndex = UNIT_LIST.findIndex((unit) => unit === price.unit)
            reset({
                id: price.id,
                price: String(price.price),
                unit: unitIndex >= 0 ? unitIndex : FORM_CONFIG.UNIT_DEFAULT,
                category: CATEGORY_LIST.some((c) => c.value === price.category)
                    ? price.category
                    : FORM_CONFIG.CATEGORY_DEFAULT,
                isAvailable: !!price.is_available,
            })
        }
    }, [visible, price, reset])

    const handleUpdate = async (data: FormData) => {
        try {
            await editPrice(data.id, {
                price: parseFloat(data.price),
                category: data.category,
                unit: UNIT_LIST[data.unit],
                is_available: data.isAvailable,
            })
            showSuccess(MESSAGES.PRICE_UPDATE_SUCCESS)
            onClose()
        } catch {
            showError(MESSAGES.ERROR_GENERIC)
        }
    }

    return (
        <BottomSheet
            isVisible={visible}
            modalProps={{ animationType: 'slide' }}
            onBackdropPress={onClose}
        >
            <View style={styles.bottomSheetContainer}>
                <Text style={styles.bottomSheetTitle}>{UI_TEXT.EDIT_PRICE}</Text>
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
                <PrimaryButton
                    title={UI_TEXT.UPDATE}
                    disabled={formState.isSubmitting}
                    loading={formState.isSubmitting}
                    onPress={handleSubmit(handleUpdate)}
                    containerStyle={styles.updateButtonContainerStyle}
                />
                <SecondaryButton
                    title={UI_TEXT.CANCEL}
                    onPress={onClose}
                    containerStyle={styles.updateButtonContainerStyle}
                />
            </View>
        </BottomSheet>
    )
}
