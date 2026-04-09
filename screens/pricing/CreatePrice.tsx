import { View, ToastAndroid, KeyboardAvoidingView, Platform } from 'react-native'
import React from 'react'
import { Button, Input, useTheme, Text, ButtonGroup, CheckBox } from '@rneui/themed'
import { Controller, useForm } from 'react-hook-form'
import { Picker } from '@react-native-picker/picker'
import Ionicons from '@react-native-vector-icons/ionicons'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { createPrice } from '../../database'
import { SafeAreaListener, useSafeAreaInsets } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useHeaderHeight } from '@react-navigation/elements'

type FormData = {
    price: string,
    unit: number,
    category: string,
    isAvailable: boolean
}

export default function CreatePrice() {

    const { theme } = useTheme()
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            price: '',
            unit: 0,
            category: 'java',
            isAvailable: false
        }
    })

    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()

    const [saving, setSaving] = React.useState(false)

    const handleSavePrice = async (data: FormData) => {
        setSaving(true)
        const created = await createPrice({
            category: data.category,
            price: parseFloat(data.price),
            unit: ['PER KG', 'PER UNIT', 'PER BUNCH'][data.unit],
            is_available: data.isAvailable
        })
        ToastAndroid.show('Price saved successfully!', ToastAndroid.SHORT);
        setSaving(false)
        navigation.popTo('PurchasePrice', { refresh: true })
    }


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.background,
                paddingHorizontal: 12,
                paddingBlock: 15,
                flexDirection: 'column',
                gap: 10,
            }}
        >
            <Controller
                name='category'
                control={control}
                // rules={{
                //     required: true
                // }}
                render={({ field: { onBlur, onChange, value } }) => (
                    <View style={{
                        width: '100%',
                        paddingHorizontal: 10,
                        marginBottom: 20
                    }}>
                        <Text
                            style={{
                                fontWeight: '600',
                                color: theme.colors.primary,
                                marginBottom: 8,
                                fontSize: 16
                            }}
                        >
                            Category
                        </Text>
                        <View
                            style={{
                                width: 'auto',
                                backgroundColor: theme.colors.secondary,
                                borderRadius: 4,
                                padding: 1
                            }}
                        >
                            <Picker
                                selectedValue={value}
                                onValueChange={onChange}
                                style={{
                                    backgroundColor: theme.colors.secondary,
                                    width: '100%',
                                }}
                                mode='dialog'
                            >
                                <Picker.Item label='Grains' value='grains' />
                                <Picker.Item label='Fruits' value='fruits' />
                                <Picker.Item label='Vegetables' value='vegetables' />
                                <Picker.Item label='Dairy' value='dairy' />
                                <Picker.Item label='Meat' value='meat' />
                            </Picker>
                        </View>
                    </View>
                )}
            />
            <Controller
                name='unit'
                control={control}
                // rules={{
                //     required: true
                // }}
                render={({ field: { onBlur, onChange, value } }) => (
                    <View
                        style={{
                            width: '100%',
                        }}
                    >
                        <Text
                            style={{
                                fontWeight: '600',
                                color: theme.colors.primary,
                                marginBottom: 8,
                                paddingHorizontal: 10,
                                fontSize: 16,
                            }}
                        >
                            Unit Selection
                        </Text>
                        <ButtonGroup
                            buttons={['PER KG', 'PER UNIT', 'PER BUNCH']}
                            selectedIndex={value}
                            onPress={(value) => onChange(value)}
                            containerStyle={{
                                height: 55,
                                borderRadius: 5,
                                padding: 1,
                                backgroundColor: theme.colors.secondary,
                            }}
                            buttonContainerStyle={{
                                padding: 2
                            }}
                            buttonStyle={{
                                borderWidth: 0,
                                backgroundColor: theme.colors.secondary,
                            }}
                            selectedButtonStyle={{
                                backgroundColor: theme.colors.white,
                                borderRadius: 4,
                                borderWidth: 0.5,
                                borderColor: theme.colors.secondary
                            }}
                            selectedTextStyle={{
                                fontWeight: 'bold',
                                color: theme.colors.black,
                                fontSize: 14
                            }}
                            innerBorderStyle={{
                                color: theme.colors.secondary
                            }}
                        />
                    </View>
                )}
            />
            <Controller
                name='price'
                control={control}
                // rules={{
                //     required: true
                // }}
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
                            paddingBlock: 5,
                            marginTop: 10,
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
                name='isAvailable'
                control={control}
                // rules={{
                //     required: true
                // }}
                render={({ field: { onBlur, onChange, value } }) => (
                    <CheckBox
                        title="Available"
                        checked={value}
                        checkedIcon={<Ionicons name='checkbox-outline' size={24} color={theme.colors.black} />}
                        uncheckedIcon={<Ionicons name='square-outline' size={24} color={theme.colors.black} />}
                        onPress={() => onChange(!value)}
                        textStyle={{
                            fontWeight: '600',
                            color: theme.colors.primary,
                            fontSize: 16
                        }}
                        containerStyle={{
                            alignSelf: 'flex-start',
                            borderWidth: 1,
                            borderColor: theme.colors.secondary,
                            borderRadius: 4
                        }}
                    />
                )}
            />
            <View style={{
                marginTop: 30,
                width: '100%',
                paddingHorizontal: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 10
            }}>
                <Button
                    title='Save Price'
                    size='md'
                    disabled={saving}
                    onPress={handleSubmit(handleSavePrice)}
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
                    disabled={saving}
                    onPress={() => navigation.goBack()}
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
                        backgroundColor: theme.colors.secondary,
                        borderWidth: 0.5,
                        borderColor: theme.colors.primary
                    }}
                />
            </View>
        </KeyboardAvoidingView>
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
