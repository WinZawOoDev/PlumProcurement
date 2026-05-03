import { View, Text } from 'react-native'
import React from 'react'
import { BottomSheet, Button, Input, useTheme } from '@rneui/themed'
import { Controller, useForm } from 'react-hook-form'

type FormData = {
    id: number
    price: string,
    unit: number,
    category: string,
    isAvailable: boolean
}

export default function EditPrice() {

    const { theme } = useTheme();
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            id: 1,
            price: '3000',
            unit: 0,
            category: 'java',
            isAvailable: false
        }
    })

    return (
        <BottomSheet isVisible={true} modalProps={{ animationType: 'slide' }} onBackdropPress={() => { }} >
            <View
                style={{
                    width: '100%',
                    backgroundColor: theme.colors.white,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    paddingVertical: 20,
                    paddingHorizontal: 25
                }}
            >
                <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.primary, fontFamily: 'Manrope' }}>Edit Price</Text>
                <View
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexDirection: 'row'
                    }}
                >
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: theme.colors.tertiary,
                            fontFamily: 'Manrope',
                            letterSpacing: 0.5,
                            lineHeight: 30
                        }}
                    >
                        # fruits
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: theme.colors.tertiary,
                            fontFamily: 'Inter',
                            letterSpacing: 0.5,
                            lineHeight: 15
                        }}
                    >
                        PER UNIT
                    </Text>
                </View>
                <Controller
                    name='price'
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            inputContainerStyle={{
                                borderBottomWidth: 0,
                                backgroundColor: theme.colors.white,
                                borderRadius: 4
                            }}
                            inputStyle={{
                                color: theme.colors.black,
                                fontWeight: 'bold',
                                fontSize: 25,
                                letterSpacing: 0.5,
                                fontFamily: 'Inter',
                                textAlign: 'center'
                            }}
                            placeholderTextColor={theme.colors.neutral}
                            placeholder='Enter price'
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            errorMessage={errors.price ? 'Price is required' : ''}
                            keyboardType='numeric'
                        />
                    )}
                />
                <Button
                    containerStyle={{
                        shadowColor: 'transparent',
                        elevation: 0,
                        shadowOpacity: 0,
                        borderWidth: 0,
                    }}
                    buttonStyle={{
                        backgroundColor: theme.colors.primary,
                        borderRadius: 4,
                        paddingVertical: 12,
                        marginTop: 10
                    }}
                    titleStyle={{
                        color: theme.colors.white,
                        fontSize: 16
                    }}
                    title='Update'
                />
                <Button
                    containerStyle={{
                        shadowColor: 'transparent',
                        elevation: 0,
                        shadowOpacity: 0,
                        borderWidth: 0,
                    }}
                    buttonStyle={{
                        backgroundColor: theme.colors.neutral,
                        borderRadius: 4,
                        paddingVertical: 12,
                        marginTop: 10
                    }}
                    titleStyle={{
                        color: theme.colors.primary,
                        fontSize: 16
                    }}
                    title='Cancel'
                />
            </View>
        </BottomSheet>
    )
}