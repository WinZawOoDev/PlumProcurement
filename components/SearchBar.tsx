import React from 'react'
import { Input, useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../styles'
import { A11Y_LABELS } from '../constants'

interface SearchBarProps {
    value: string
    onChangeText: (text: string) => void
    placeholder: string
}

export function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
    const styles = useStyles()
    const { theme } = useTheme()
    return (
        <Input
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            inputContainerStyle={styles.formInputContainer}
            inputStyle={styles.formInput}
            containerStyle={styles.searchBarContainer}
            rightIcon={
                <Ionicons
                    name="close-circle-outline"
                    size={22}
                    color={theme.colors.tertiary}
                    onPress={() => onChangeText('')}
                    accessibilityLabel={A11Y_LABELS.CLEAR_SEARCH}
                />
            }
        />
    )
}
