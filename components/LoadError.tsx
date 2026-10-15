import React from 'react'
import { View } from 'react-native'
import { useStyles } from '../styles'
import { useLocalizedConstants } from '../hooks/useLocalizedConstants'
import { getErrorMessage } from '../utils/errors'
import { EmptyState } from './EmptyState'
import { PrimaryButton } from './buttons/Button'

interface LoadErrorProps {
    error: unknown
    onRetry: () => void
}

/** Inline error state for a failed list query, with a retry action. */
export function LoadError({ error, onRetry }: LoadErrorProps) {
    const styles = useStyles()
    const { UI_TEXT } = useLocalizedConstants()
    return (
        <View style={styles.fillContainer}>
            <EmptyState
                icon="alert-circle-outline"
                title={UI_TEXT.SOMETHING_WENT_WRONG}
                description={getErrorMessage(error)}
            />
            <PrimaryButton
                compact
                title={UI_TEXT.RETRY}
                onPress={onRetry}
                containerStyle={styles.updateButtonContainerStyle}
            />
        </View>
    )
}
