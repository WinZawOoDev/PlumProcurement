import { View } from 'react-native'
import React from 'react'
import { Button, Input, useTheme, Text } from '@rneui/themed'
import { Controller, useForm } from 'react-hook-form'

export default function CreatePrice() {

    const { theme } = useTheme()

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            price: '',
            unit: '',
            category: ''
        }
    })

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.background,
                paddingHorizontal: 12,
                paddingBlock: 15,
                flexDirection: 'column',
                gap: 10
            }}>
            <Controller
                name='category'
                control={control}
                rules={{
                    required: true
                }}
                render={({ field: { onBlur, onChange, value } }) => (
                    <Input
                        label='Category'
                        labelStyle={{
                            fontWeight: '600',
                            color: theme.colors.primary
                        }}
                        placeholder='select category'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        inputContainerStyle={{
                            borderBottomWidth: 0,
                            backgroundColor: theme.colors.secondary,
                            borderRadius: 4,
                            paddingBlock: 2,
                            marginTop: 10
                        }}
                        inputStyle={{
                            paddingHorizontal: 15,
                            fontSize: 18,
                            paddingBlock: 10
                        }}
                    />
                )}
            />
            <Controller
                name='unit'
                control={control}
                rules={{
                    required: true
                }}
                render={({ field: { onBlur, onChange, value } }) => (
                    <Input
                        label='Unit'
                        labelStyle={{
                            fontWeight: '600',
                            color: theme.colors.primary
                        }}
                        placeholder='e.g. kg, bushel, etc.'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        inputContainerStyle={{
                            borderBottomWidth: 0,
                            backgroundColor: theme.colors.secondary,
                            borderRadius: 4,
                            paddingBlock: 2,
                            marginTop: 10
                        }}
                        inputStyle={{
                            paddingHorizontal: 15,
                            fontSize: 18,
                            paddingBlock: 10
                        }}
                    />
                )}
            />
            <Controller
                name='price'
                control={control}
                rules={{
                    required: true
                }}
                render={({ field: { onBlur, onChange, value } }) => (
                    <Input
                        label='Price'
                        labelStyle={{
                            fontWeight: '600',
                            color: theme.colors.primary
                        }}
                        placeholder='e.g. 12.50'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType='decimal-pad'
                        inputContainerStyle={{
                            borderBottomWidth: 0,
                            backgroundColor: theme.colors.secondary,
                            borderRadius: 4,
                            paddingBlock: 2,
                            marginTop: 10
                        }}
                        inputStyle={{
                            paddingHorizontal: 15,
                            fontSize: 18,
                            paddingBlock: 10
                        }}
                    />
                )}
            />
            <View style={{
                marginTop: 20,
                width: '100%',
                paddingHorizontal: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 10
            }}>
                <Button
                    title='Save Price'
                    size='md'
                    onPress={handleSubmit((data) => console.log(data))}
                    containerStyle={{
                        shadowColor: 'transparent',
                        elevation: 0,
                        shadowOpacity: 0,
                    }}
                    buttonStyle={{
                        paddingBlock: 15,
                        borderRadius: 5,
                        backgroundColor: theme.colors.primary
                    }}
                />
                <Button
                    title='Cancel'
                    size='md'
                    onPress={handleSubmit((data) => console.log(data))}
                    titleStyle={{
                        color: theme.colors.primary,
                        fontWeight: 'bold'
                    }}
                    containerStyle={{
                        shadowColor: 'transparent',
                        elevation: 0,
                        shadowOpacity: 0,
                    }}
                    buttonStyle={{
                        paddingBlock: 15,
                        borderRadius: 5,
                        backgroundColor: theme.colors.secondary
                    }}
                />
            </View>
        </View>
    )
}

export function CreatePriceHeaderTitle() {
    const { theme } = useTheme()
    return (
        <View >
            <Text
                style={{
                    color: theme.colors.primary,
                    fontWeight: '700',
                    fontSize: 20,
                    fontFamily: 'Manrope',
                    letterSpacing: 0.5,
                }}>
                Price Entry
            </Text>
        </View>
    )
}
