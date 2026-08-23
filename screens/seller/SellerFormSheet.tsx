import { View, Text, ToastAndroid } from 'react-native'
import React, { useEffect } from 'react'
import { BottomSheet } from '@rneui/themed'
import { useForm } from 'react-hook-form'
import { useStyles } from '../../styles'
import { FormInputField } from '../../components/forms/FormFields'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { UI_TEXT, MESSAGES, VALIDATION_MESSAGES } from '../../constants'
import { sellerService, NewSeller } from '../../services/sellerService'
import { ISeller } from '../../database'

type FormData = {
    name: string
    phone: string
}

interface SellerFormSheetProps {
    visible: boolean
    seller: ISeller | null
    onClose: () => void
    onSaved: () => void
}

export default function SellerFormSheet({ visible, seller, onClose, onSaved }: SellerFormSheetProps) {
    const styles = useStyles()
    const editing = !!seller

    const { control, handleSubmit, reset, formState } = useForm<FormData>({
        defaultValues: { name: '', phone: '' },
        mode: 'onBlur',
    })

    useEffect(() => {
        if (visible) {
            reset({
                name: seller?.name ?? '',
                phone: seller?.phone ?? '',
            })
        }
    }, [visible, seller, reset])

    const handleSave = async (data: FormData) => {
        try {
            const payload: NewSeller = {
                name: data.name.trim(),
                phone: data.phone.trim() || null,
            }
            if (editing) {
                await sellerService.editSeller(seller.id, payload)
                ToastAndroid.show(MESSAGES.SELLER_UPDATE_SUCCESS, ToastAndroid.SHORT)
            } else {
                await sellerService.addSeller(payload)
                ToastAndroid.show(MESSAGES.SELLER_SAVED_SUCCESS, ToastAndroid.SHORT)
            }
            onSaved()
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
                <Text style={styles.bottomSheetTitle}>
                    {editing ? UI_TEXT.EDIT_SELLER : UI_TEXT.ADD_SELLER}
                </Text>
                <FormInputField
                    name="name"
                    control={control}
                    label={UI_TEXT.SELLER_NAME}
                    placeholder="e.g. U Ba"
                    required
                    rules={{ required: VALIDATION_MESSAGES.NAME_REQUIRED }}
                />
                <FormInputField
                    name="phone"
                    control={control}
                    label={UI_TEXT.PHONE}
                    placeholder="e.g. 09-123-456-789"
                    keyboardType="default"
                />
                <PrimaryButton
                    title={editing ? UI_TEXT.UPDATE : UI_TEXT.SAVE}
                    disabled={formState.isSubmitting}
                    loading={formState.isSubmitting}
                    onPress={handleSubmit(handleSave)}
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
