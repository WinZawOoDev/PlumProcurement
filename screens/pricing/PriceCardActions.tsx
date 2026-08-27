import React from 'react'
import { View } from 'react-native'
import { Button } from '@rneui/themed'
import { useStyles } from '../../styles'
import { A11Y_LABELS } from '../../constants'

interface Props {
    onEdit?: () => void
    onDelete?: () => void
}

export function PriceCardActions({ onEdit, onDelete }: Props) {
    const styles = useStyles()
    return (
        <View style={styles.priceCardActionsRow}>
            <Button
                buttonStyle={styles.rowIconButton}
                title="Edit"
                titleStyle={styles.priceCardEditButtonTitle}
                onPress={onEdit}
                accessibilityLabel={A11Y_LABELS.EDIT_PRICE}
            />
            <Button
                buttonStyle={[styles.rowIconButton, styles.rowIconDeleteButton]}
                icon={{ name: 'trash-outline', type: 'ionicon', color: 'white', size: 16 }}
                onPress={onDelete}
                accessibilityLabel={A11Y_LABELS.DELETE_PRICE}
            />
        </View>
    )
}
