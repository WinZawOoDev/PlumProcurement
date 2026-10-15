import { Text } from 'react-native'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useStyles } from '../../styles'
import { DetailSheet } from '../../components/DetailSheet'
import { FORM_CONFIG, CATEGORY_LIST, UNIT_LIST } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { usePrices } from '../../context/PriceContext'
import { getErrorMessage } from '../../utils/errors'
import { IPrice } from '../../types/database'
import { showSuccess, showError } from '../../utils/notifications'
import { PriceFormActions, PriceFormFields, PriceFormValues } from './PriceForm'

interface EditPriceFormValues extends PriceFormValues {
    id: number
}

interface EditPriceProps {
    visible: boolean
    price: IPrice | null
    onClose: () => void
}

export default function EditPrice({ visible, price, onClose }: EditPriceProps) {
    const styles = useStyles()
    const { UI_TEXT, MESSAGES } = useLocalizedConstants()
    const { editPrice } = usePrices()

    const { control, handleSubmit, reset, formState } = useForm<EditPriceFormValues>({
        defaultValues: {
            id: 0,
            price: FORM_CONFIG.PRICE_DEFAULT,
            unit: FORM_CONFIG.UNIT_DEFAULT,
            category: FORM_CONFIG.CATEGORY_DEFAULT,
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
            })
        }
    }, [visible, price, reset])

    const handleUpdate = async (data: EditPriceFormValues) => {
        try {
            await editPrice(data.id, {
                price: parseFloat(data.price),
                category: data.category,
                unit: UNIT_LIST[data.unit],
            })
            showSuccess(MESSAGES.PRICE_UPDATE_SUCCESS)
            onClose()
        } catch (error) {
            showError(getErrorMessage(error))
        }
    }

    return (
        <DetailSheet visible={visible} onClose={onClose}>
            <Text style={styles.bottomSheetTitle}>{UI_TEXT.EDIT_PRICE}</Text>
            <PriceFormFields control={control} />
            <PriceFormActions
                primaryTitle={UI_TEXT.UPDATE}
                saving={formState.isSubmitting}
                onSubmit={handleSubmit(handleUpdate)}
                onCancel={onClose}
                buttonStyle={styles.updateButtonContainerStyle}
            />
        </DetailSheet>
    )
}
