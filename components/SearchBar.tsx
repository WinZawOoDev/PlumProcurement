import React, { useEffect, useState } from 'react'
import { Input, useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../styles'
import { A11Y_LABELS } from '../constants'
import { debounce } from '../utils'

interface SearchBarProps {
    value: string
    onChangeText: (text: string) => void
    placeholder: string
    debounceMs?: number
}

export function SearchBar({ value, onChangeText, placeholder, debounceMs = 300 }: SearchBarProps) {
    const styles = useStyles()
    const { theme } = useTheme()
    const [localValue, setLocalValue] = useState(value)

    useEffect(() => {
        setLocalValue(value)
    }, [value])

    const debouncedOnChange = React.useMemo(
        () => debounce((text: string) => onChangeText(text), debounceMs),
        [onChangeText, debounceMs]
    )

    const handleChange = (text: string) => {
        setLocalValue(text)
        debouncedOnChange(text)
    }

    const handleClear = () => {
        setLocalValue('')
        onChangeText('')
    }

    return (
        <Input
            placeholder={placeholder}
            value={localValue}
            onChangeText={handleChange}
            accessibilityLabel={placeholder}
            accessibilityRole="search"
            leftIcon={
                <Ionicons
                    name="search"
                    size={17}
                    color={theme.colors.grey4}
                    style={styles.searchBarIcon}
                />
            }
            rightIcon={
                localValue.length > 0 ? (
                    <Ionicons
                        name="close-circle-outline"
                        size={20}
                        color={theme.colors.tertiary}
                        onPress={handleClear}
                        accessibilityLabel={A11Y_LABELS.CLEAR_SEARCH}
                    />
                ) : undefined
            }
            inputContainerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
            containerStyle={styles.searchBarContainer}
        />
    )
}
