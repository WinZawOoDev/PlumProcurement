import { View, Text } from 'react-native'
import React from 'react'
import { BottomSheet } from '@rneui/themed'
import { useForm } from 'react-hook-form'
import { useStyles } from '../../styles'
import { FormInputField } from '../../components/forms/FormFields'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { UI_TEXT } from '../../constants'

type FormData = {
    id: number
    price: string
    unit: number
    category: string
    isAvailable: boolean
}

export default function EditPrice() {
    const styles = useStyles()
    const { control, handleSubmit } = useForm<FormData>({
        defaultValues: {
            id: 1,
            price: '3000',
            unit: 0,
            category: 'fruits',
            isAvailable: false
        }
    })

    const handleUpdate = (_data: FormData) => {
        // TODO: Implement update logic
    }

    const handleCancel = () => {
        // TODO: Implement cancel logic
    }

    return (
        <BottomSheet isVisible={true} modalProps={{ animationType: 'slide' }} onBackdropPress={() => { }} >
            <View style={styles.bottomSheetContainer}>
                <Text style={styles.bottomSheetTitle}>{UI_TEXT.EDIT_PRICE}</Text>
                <View style={styles.bottomSheetHeaderRow}>
                    <Text style={styles.bottomSheetCategoryText}>
                        # {UI_TEXT.UNIT}
                    </Text>
                    <Text style={styles.bottomSheetUnitText}>
                        {UI_TEXT.UNIT_SELECTION}
                    </Text>
                </View>
                <FormInputField
                    name="price"
                    control={control}
                    label={UI_TEXT.PRICE}
                    placeholder="Enter price"
                    keyboardType="decimal-pad"
                />
                <PrimaryButton
                    title={UI_TEXT.UPDATE}
                    onPress={handleSubmit(handleUpdate)}
                    containerStyle={styles.updateButtonContainerStyle}
                />
                <SecondaryButton
                    title={UI_TEXT.CANCEL}
                    onPress={handleCancel}
                    containerStyle={styles.updateButtonContainerStyle}
                />
            </View>
        </BottomSheet>
    )
}