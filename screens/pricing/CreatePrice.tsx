import { KeyboardAvoidingView, Platform } from 'react-native'
import React from 'react'
import { Text } from '@rneui/themed'
import { useForm } from 'react-hook-form'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useStyles } from '../../styles'
import { usePrices } from '../../context/PriceContext'
import { getErrorMessage } from '../../utils/errors'
import { PriceFormActions, PriceFormFields, PriceFormValues } from './PriceForm'
import { FORM_CONFIG, UNIT_LIST, ROUTES, ANIMATIONS } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { showSuccess, showError } from '../../utils/notifications'
import { useAsync } from '../../hooks/useAsync'
import { useOrientation } from '../../hooks/useOrientation'

export default function CreatePrice() {
    const styles = useStyles()
    const { UI_TEXT, MESSAGES } = useLocalizedConstants()
    const { isLandscape } = useOrientation()
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const { addPrice } = usePrices()
    const { loading: saving, execute } = useAsync()

    const { control, handleSubmit } = useForm<PriceFormValues>({
        defaultValues: {
            price: FORM_CONFIG.PRICE_DEFAULT,
            unit: FORM_CONFIG.UNIT_DEFAULT,
            category: FORM_CONFIG.CATEGORY_DEFAULT,
        },
        mode: 'onBlur',
    })

    const handleSavePrice = async (data: PriceFormValues) => {
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
                // No re-throw: surfacing the toast is the whole error path, and
                // re-throwing from an onValid handler causes an unhandled rejection.
                showError(getErrorMessage(error))
            }
        })
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? ANIMATIONS.KEYBOARD_AVOID_BEHAVIOR : 'height'}
            style={styles.createPriceContainer}
        >
            <PriceFormFields control={control} />
            <PriceFormActions
                primaryTitle={UI_TEXT.SAVE_PRICE}
                saving={saving}
                onSubmit={handleSubmit(handleSavePrice)}
                onCancel={() => navigation.goBack()}
                wrapperStyle={[
                    styles.createPriceActions,
                    styles.responsiveContent,
                    isLandscape && styles.responsiveContentLandscape,
                ]}
                primaryTestID="btn-Save Price"
            />
        </KeyboardAvoidingView>
    )
}

export function CreatePriceHeaderTitle() {
    const styles = useStyles()
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <Text style={styles.headerTitleText}>
            {UI_TEXT.PRICE_ENTRY}
        </Text>
    )
}
