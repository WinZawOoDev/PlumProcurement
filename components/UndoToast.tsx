import React from 'react'
import { Text as RNText, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { useStyles } from '../styles'
import { useLocalizedConstants } from '../hooks/useLocalizedConstants'

interface UndoToastProps {
    text1?: string
    props?: { onUndo?: () => void }
}

/** Bottom toast with an inline Undo action, registering as the `undo` type. */
export function UndoToast({ text1, props }: UndoToastProps) {
    const styles = useStyles()
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <View style={styles.undoToast}>
            <RNText style={styles.undoToastText} numberOfLines={2}>
                {text1}
            </RNText>
            <TouchableOpacity
                onPress={() => {
                    props?.onUndo?.()
                    Toast.hide()
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessible
                accessibilityRole="button"
                accessibilityLabel={UI_TEXT.UNDO}
            >
                <RNText style={styles.undoToastAction}>{UI_TEXT.UNDO}</RNText>
            </TouchableOpacity>
        </View>
    )
}

export const toastConfig = {
    undo: ({ text1, props }: UndoToastProps) => <UndoToast text1={text1} props={props} />,
}
