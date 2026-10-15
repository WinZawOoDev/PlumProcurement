import { View, type StyleProp, type ViewStyle } from 'react-native'
import React from 'react'
import { Control, FieldValues, Path } from 'react-hook-form'
import { FORM_CONFIG, PRICE_PATTERN, UNIT_LIST } from '../../constants'
import { useLocalizedConstants } from '../../hooks/useLocalizedConstants'
import { FormButtonGroupField, FormInputField, FormSelectField } from '../../components/forms/FormFields'
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Button'

/** Field values shared by the create and edit price forms. */
export interface PriceFormValues extends FieldValues {
    price: string
    unit: number
    category: string
}

/** Category/unit/price fields shared by CreatePrice and EditPrice. */
export function PriceFormFields<T extends PriceFormValues>({ control }: { control: Control<T> }) {
    const { UI_TEXT, VALIDATION_MESSAGES, CATEGORY_LIST, UNITS } = useLocalizedConstants()
    return (
        <>
            <FormSelectField
                name={"category" as Path<T>}
                control={control}
                label={UI_TEXT.CATEGORY}
                options={CATEGORY_LIST}
                required
                rules={{ required: VALIDATION_MESSAGES.CATEGORY_REQUIRED }}
            />

            <FormButtonGroupField
                name={"unit" as Path<T>}
                control={control}
                label={UI_TEXT.UNIT_SELECTION}
                buttons={UNIT_LIST.map((unit) => UNITS[unit] ?? unit)}
                required
                rules={{ required: VALIDATION_MESSAGES.UNIT_REQUIRED }}
            />

            <FormInputField
                name={"price" as Path<T>}
                control={control}
                label={UI_TEXT.PRICE}
                placeholder={UI_TEXT.PRICE_PLACEHOLDER}
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

/** Save/cancel actions shared by CreatePrice and EditPrice. */
export function PriceFormActions({
    primaryTitle,
    saving,
    onSubmit,
    onCancel,
    wrapperStyle,
    buttonStyle,
    primaryTestID,
}: {
    primaryTitle: string
    saving: boolean
    onSubmit: () => void
    onCancel: () => void
    /** When omitted the buttons render unwrapped (edit sheet layout). */
    wrapperStyle?: StyleProp<ViewStyle>
    buttonStyle?: StyleProp<ViewStyle>
    primaryTestID?: string
}) {
    const { UI_TEXT } = useLocalizedConstants()
    const buttons = (
        <>
            <PrimaryButton
                title={primaryTitle}
                disabled={saving}
                loading={saving}
                onPress={onSubmit}
                containerStyle={buttonStyle}
                testID={primaryTestID}
            />
            <SecondaryButton
                title={UI_TEXT.CANCEL}
                disabled={saving}
                onPress={onCancel}
                containerStyle={buttonStyle}
            />
        </>
    )
    if (!wrapperStyle) return buttons
    return <View style={wrapperStyle}>{buttons}</View>
}
