import React, { useEffect, useRef, useState } from 'react'
import { Input, useTheme } from '@rneui/themed'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useStyles } from '../styles'
import { useLocalizedConstants } from '../hooks/useLocalizedConstants'
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
    const { A11Y_LABELS } = useLocalizedConstants()
    const [localValue, setLocalValue] = useState(value)

    useEffect(() => {
        setLocalValue(value)
    }, [value])

    // Keep the latest callback in a ref so the debounced wrapper is stable even
    // when the parent passes an inline handler (otherwise every parent render
    // would recreate the debouncer and drop a pending keystroke).
    const onChangeRef = useRef(onChangeText)
    useEffect(() => {
        onChangeRef.current = onChangeText
    }, [onChangeText])

    const debouncedOnChange = React.useMemo(
        () => debounce((text: string) => onChangeRef.current(text), debounceMs),
        [debounceMs]
    )

    // Drop any pending invocation on unmount so it can't fire setState on the
    // parent after this input is gone.
    useEffect(() => () => debouncedOnChange.cancel(), [debouncedOnChange])

    const handleChange = (text: string) => {
        setLocalValue(text)
        debouncedOnChange(text)
    }

    const handleClear = () => {
        debouncedOnChange.cancel()
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
