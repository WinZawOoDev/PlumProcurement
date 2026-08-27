import React from 'react'
import { View } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useTheme } from '@rneui/themed'
import { IconButton } from '../../components/buttons/Button'
import { A11Y_LABELS } from '../../constants'

interface Props {
    onEdit?: () => void
    onDelete?: () => void
}

export function PriceCardActions({ onEdit, onDelete }: Props) {
    const { theme } = useTheme()
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <IconButton
                icon={<Ionicons name="pencil-outline" size={16} color={theme.colors.grey5} />}
                variant="ghost"
                small
                onPress={onEdit}
                accessibilityLabel={A11Y_LABELS.EDIT_PRICE}
            />
            <IconButton
                icon={<Ionicons name="trash-outline" size={16} color={theme.colors.error} />}
                variant="ghost"
                small
                onPress={onDelete}
                accessibilityLabel={A11Y_LABELS.DELETE_PRICE}
            />
        </View>
    )
}
