import React from 'react'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useTheme } from '@rneui/themed'
import { IconButton } from './buttons/Button'
import { DIMENSIONS } from '../constants'

interface SearchIconButtonProps {
    active: boolean
    onPress?: () => void
    accessibilityLabel?: string
}

/** Ghost icon button that toggles a screen's search bar (shared look everywhere). */
export function SearchIconButton({ active, onPress, accessibilityLabel }: SearchIconButtonProps) {
    const { theme } = useTheme()
    return (
        <IconButton
            icon={
                <Ionicons
                    name={active ? 'search' : 'search-outline'}
                    size={DIMENSIONS.ICON_SIZE_MEDIUM}
                    color={active ? theme.colors.primary : theme.colors.grey4}
                />
            }
            variant="ghost"
            onPress={onPress}
            accessibilityLabel={accessibilityLabel}
        />
    )
}
