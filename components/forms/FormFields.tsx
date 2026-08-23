import React from 'react'
import { View } from 'react-native'
import { Input, Text, CheckBox, ButtonGroup, useTheme } from '@rneui/themed'
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form'
import { Picker } from '@react-native-picker/picker'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../../styles'

interface FormSelectFieldProps<T extends FieldValues> {
    name: Path<T>
    control: Control<T>
    label: string
    options: Array<{ label: string; value: string | number }>
    placeholder?: string
    required?: boolean
    rules?: RegisterOptions<T>
}

export function FormSelectField<T extends FieldValues>({
    name,
    control,
    label,
    options,
    placeholder,
    required = false,
    rules,
}: FormSelectFieldProps<T>) {
    const styles = useStyles()

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View style={styles.categoryContainer}>
                    <Text style={styles.categoryLabel}>
                        {label} {required && '*'}
                    </Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={value}
                            onValueChange={onChange}
                            style={styles.picker}
                            mode="dialog"
                        >
                            {placeholder && <Picker.Item label={placeholder} value="" />}
                            {options.map((option) => (
                                <Picker.Item
                                    key={`${option.value}`}
                                    label={option.label}
                                    value={option.value}
                                />
                            ))}
                        </Picker>
                    </View>
                    {error && <Text style={styles.formErrorText}>{error.message}</Text>}
                </View>
            )}
        />
    )
}

interface FormInputFieldProps<T extends FieldValues> {
    name: Path<T>
    control: Control<T>
    label: string
    placeholder?: string
    keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address'
    required?: boolean
    rules?: RegisterOptions<T>
}

export function FormInputField<T extends FieldValues>({
    name,
    control,
    label,
    placeholder,
    keyboardType = 'default',
    required: _required = false,
    rules,
}: FormInputFieldProps<T>) {
    const styles = useStyles()

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
                <Input
                    label={label}
                    labelStyle={styles.formInputLabel}
                    placeholder={placeholder}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType={keyboardType}
                    inputContainerStyle={styles.formInputContainer}
                    inputStyle={styles.formInput}
                    errorMessage={error?.message || ''}
                />
            )}
        />
    )
}

interface FormCheckboxFieldProps<T extends FieldValues> {
    name: Path<T>
    control: Control<T>
    label: string
}

export function FormCheckboxField<T extends FieldValues>({
    name,
    control,
    label,
}: FormCheckboxFieldProps<T>) {
    const styles = useStyles()
    const { theme } = useTheme()

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) => (
                <CheckBox
                    title={label}
                    checked={value}
                    checkedIcon={<Ionicons name="checkbox-outline" size={24} color={theme.colors.black} />}
                    uncheckedIcon={<Ionicons name="square-outline" size={24} color={theme.colors.black} />}
                    onPress={() => onChange(!value)}
                    textStyle={styles.formCheckboxText}
                    containerStyle={styles.formCheckboxContainer}
                />
            )}
        />
    )
}

interface FormButtonGroupFieldProps<T extends FieldValues> {
    name: Path<T>
    control: Control<T>
    label: string
    buttons: string[]
    required?: boolean
    rules?: RegisterOptions<T>
}

export function FormButtonGroupField<T extends FieldValues>({
    name,
    control,
    label,
    buttons,
    required = false,
    rules,
}: FormButtonGroupFieldProps<T>) {
    const styles = useStyles()

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View style={styles.unitContainer}>
                    <Text style={styles.unitLabel}>
                        {label} {required && '*'}
                    </Text>
                    <ButtonGroup
                        buttons={buttons}
                        selectedIndex={value}
                        onPress={(index) => onChange(index)}
                        containerStyle={styles.buttonGroupContainer}
                        buttonContainerStyle={styles.buttonGroupButtonContainer}
                        buttonStyle={styles.formButtonGroupButton}
                        selectedButtonStyle={styles.formButtonGroupSelectedButton}
                        selectedTextStyle={styles.formButtonGroupSelectedText}
                        innerBorderStyle={styles.formButtonGroupInnerBorder}
                    />
                    {error && <Text style={styles.formErrorText}>{error.message}</Text>}
                </View>
            )}
        />
    )
}
