import React from 'react'
import { View } from 'react-native'
import { Text } from '@rneui/themed'
import { Picker } from '@react-native-picker/picker'
import { useStyles } from '../styles'
import { PICKER_CONFIG } from '../constants'

interface SelectPickerProps {
    label: string
    selectedValue: string
    onValueChange: (value: string) => void
    items: Array<{ label: string; value: string }>
}

export function SelectPicker({ label, selectedValue, onValueChange, items }: SelectPickerProps) {
    const styles = useStyles()
    return (
        <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>{label}</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={selectedValue}
                    onValueChange={(v) => onValueChange(v as string)}
                    style={styles.picker}
                    mode={PICKER_CONFIG.MODE}
                >
                    {items.map((it) => (
                        <Picker.Item key={it.value} label={it.label} value={it.value} />
                    ))}
                </Picker>
            </View>
        </View>
    )
}
