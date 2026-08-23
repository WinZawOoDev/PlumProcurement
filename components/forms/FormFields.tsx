import React from 'react'
import { View } from 'react-native'
import { Input, Text, useTheme, CheckBox, ButtonGroup } from '@rneui/themed'
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
    const { theme } = useTheme()
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
                    {error && <Text style={{ color: theme.colors.error, fontSize: 12 }}>{error.message}</Text>}
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
    const { theme } = useTheme()

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
                <Input
                    label={label}
                    labelStyle={{
                        fontWeight: '600',
                        color: theme.colors.primary,
                    }}
                    placeholder={placeholder}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType={keyboardType}
                    inputContainerStyle={{
                        borderBottomWidth: 0,
                        backgroundColor: theme.colors.secondary,
                        borderRadius: 4,
                        paddingBlock: 5,
                        marginTop: 10,
                    }}
                    inputStyle={{
                        paddingHorizontal: 15,
                        fontSize: 18,
                        paddingBlock: 10,
                    }}
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
                    textStyle={{
                        fontWeight: '600',
                        color: theme.colors.primary,
                        fontSize: 16,
                    }}
                    containerStyle={{
                        alignSelf: 'flex-start',
                        borderWidth: 1,
                        borderColor: theme.colors.secondary,
                        borderRadius: 4,
                    }}
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
    const { theme } = useTheme()
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
                        buttonStyle={{
                            borderWidth: 0,
                            backgroundColor: theme.colors.secondary,
                        }}
                        selectedButtonStyle={{
                            backgroundColor: theme.colors.white,
                            borderRadius: 4,
                            borderWidth: 0.5,
                            borderColor: theme.colors.secondary,
                        }}
                        selectedTextStyle={{
                            fontWeight: 'bold',
                            color: theme.colors.black,
                            fontSize: 14,
                        }}
                        innerBorderStyle={{
                            color: theme.colors.secondary,
                        }}
                    />
                    {error && <Text style={{ color: theme.colors.error, fontSize: 12 }}>{error.message}</Text>}
                </View>
            )}
        />
    )
}
