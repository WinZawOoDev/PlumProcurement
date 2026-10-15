import React from 'react'
import { View, ViewStyle } from 'react-native'
import { BottomSheet } from '@rneui/themed'
import { useStyles } from '../styles'
import { ANIMATIONS } from '../constants'

interface DetailSheetProps {
    visible: boolean
    onClose: () => void
    children: React.ReactNode
    containerStyle?: ViewStyle
}

/** Shared BottomSheet scaffolding: visibility, backdrop dismiss, standard container. */
export function DetailSheet({ visible, onClose, children, containerStyle }: DetailSheetProps) {
    const styles = useStyles()
    return (
        <BottomSheet isVisible={visible} onBackdropPress={onClose} modalProps={{ animationType: ANIMATIONS.BOTTOM_SHEET_ANIMATION }}>
            <View style={[styles.bottomSheetContainer, styles.responsiveSheet, containerStyle]}>
                {children}
            </View>
        </BottomSheet>
    )
}
