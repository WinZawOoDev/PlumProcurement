import React from 'react'
import { View } from 'react-native'
import FontAwesomeIcon from '@react-native-vector-icons/fontawesome-free-solid'
import Ionicons from '@react-native-vector-icons/ionicons'
import { useTheme } from '@rneui/themed'
import { IconButton } from '../../components/buttons/Button'
import { A11Y_LABELS } from '../../constants'
import { useStyles } from '../../styles'

interface Props {
    onEdit?: () => void
    onDelete?: () => void
}

export function PriceCardActions({ onEdit, onDelete }: Props) {
    const { theme } = useTheme()
    const styles = useStyles()
    return (
        <View style={styles.priceCardActionsContainer}>
            <IconButton
                icon={<FontAwesomeIcon name="edit" size={16} color={theme.colors.grey5} />}
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
