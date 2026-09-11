import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { BottomSheet } from '@rneui/themed'
import { Control, useForm } from 'react-hook-form'
import { useStyles } from '../../styles'
import { FormInputField } from '../../components/forms/FormFields'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { sellerService, NewSeller } from '../../services/sellerService'
import { ISeller } from '../../types/database'
import { showSuccess, showError } from '../../utils/notifications'

type FormData = {
    name: string
    phone: string
    address: string
}

interface SellerFormSheetProps {
    visible: boolean
    seller: ISeller | null
    onClose: () => void
    onSaved: () => void
}

function SellerFormFields({ control }: { control: Control<FormData> }) {
    const { UI_TEXT, VALIDATION_MESSAGES } = useLocalizedConstants()
    return (
        <>
            <FormInputField
                name="name"
                control={control}
                label={UI_TEXT.SELLER_NAME}
                placeholder={UI_TEXT.SELLER_NAME_PLACEHOLDER}
                required
                rules={{ required: VALIDATION_MESSAGES.NAME_REQUIRED }}
            />
            <FormInputField
                name="phone"
                control={control}
                label={UI_TEXT.PHONE}
                placeholder={UI_TEXT.PHONE_PLACEHOLDER}
                keyboardType="default"
                required
                rules={{ required: VALIDATION_MESSAGES.PHONE_REQUIRED }}
            />
            <FormInputField
                name="address"
                control={control}
                label={UI_TEXT.ADDRESS}
                placeholder={UI_TEXT.ADDRESS_PLACEHOLDER}
                keyboardType="default"
                required
                rules={{ required: VALIDATION_MESSAGES.ADDRESS_REQUIRED }}
            />
        </>
    )
}

function SellerFormActions({
    editing,
    saving,
    onSubmit,
    onCancel,
}: {
    editing: boolean
    saving: boolean
    onSubmit: () => void
    onCancel: () => void
}) {
    const styles = useStyles()
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <>
            <PrimaryButton
                title={editing ? UI_TEXT.UPDATE : UI_TEXT.SAVE}
                disabled={saving}
                loading={saving}
                onPress={onSubmit}
                containerStyle={styles.updateButtonContainerStyle}
            />
            <SecondaryButton
                title={UI_TEXT.CANCEL}
                onPress={onCancel}
                containerStyle={styles.updateButtonContainerStyle}
            />
        </>
    )
}

export default function SellerFormSheet({ visible, seller, onClose, onSaved }: SellerFormSheetProps) {
    const styles = useStyles()
    const { UI_TEXT, MESSAGES } = useLocalizedConstants()
    const editing = !!seller

    const { control, handleSubmit, reset, formState } = useForm<FormData>({
        defaultValues: { name: '', phone: '', address: '' },
        mode: 'onBlur',
    })

    useEffect(() => {
        if (visible) {
            reset({
                name: seller?.name ?? '',
                phone: seller?.phone ?? '',
                address: seller?.address ?? '',
            })
        }
    }, [visible, seller, reset])

    const handleSave = async (data: FormData) => {
        try {
            const payload: NewSeller = {
                name: data.name.trim(),
                phone: data.phone.trim(),
                address: data.address.trim(),
            }
            if (editing) {
                await sellerService.editSeller(seller.id, payload)
                showSuccess(MESSAGES.SELLER_UPDATE_SUCCESS)
            } else {
                await sellerService.addSeller(payload)
                showSuccess(MESSAGES.SELLER_SAVED_SUCCESS)
            }
            onSaved()
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
                <Text style={styles.bottomSheetTitle}>
                    {editing ? UI_TEXT.EDIT_SELLER : UI_TEXT.ADD_SELLER}
                </Text>
                <SellerFormFields control={control} />
                <SellerFormActions
                    editing={editing}
                    saving={formState.isSubmitting}
                    onSubmit={handleSubmit(handleSave)}
                    onCancel={onClose}
                />
            </View>
        </BottomSheet>
    )
}
