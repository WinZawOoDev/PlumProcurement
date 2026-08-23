import { View, Text, ToastAndroid } from 'react-native'
import React, { useEffect } from 'react'
import { BottomSheet } from '@rneui/themed'
import { useForm } from 'react-hook-form'
import { useStyles } from '../../styles'
import { FormInputField } from '../../components/forms/FormFields'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { UI_TEXT, MESSAGES, VALIDATION_MESSAGES, PRICE_PATTERN, FORM_CONFIG } from '../../constants'
import { usePrices } from '../../context/PriceContext'
import { IPrice } from '../../database'

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

    const { control, handleSubmit, reset } = useForm<FormData>({
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
        if (price) {
            reset({
                id: price.id,
                price: String(price.price),
                unit: 0,
                category: price.category,
                isAvailable: !!price.is_available,
            })
        }
    }, [price, reset])

    const handleUpdate = async (data: FormData) => {
        try {
            await editPrice(data.id, { price: parseFloat(data.price) })
            ToastAndroid.show(MESSAGES.PRICE_UPDATE_SUCCESS, ToastAndroid.SHORT)
            onClose()
        } catch {
            ToastAndroid.show(MESSAGES.ERROR_GENERIC, ToastAndroid.LONG)
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
                <View style={styles.bottomSheetHeaderRow}>
                    <Text style={styles.bottomSheetCategoryText}>
                        # {price?.category ?? UI_TEXT.CATEGORY}
                    </Text>
                    <Text style={styles.bottomSheetUnitText}>
                        {price?.unit ?? UI_TEXT.UNIT}
                    </Text>
                </View>
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
                <PrimaryButton
                    title={UI_TEXT.UPDATE}
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
