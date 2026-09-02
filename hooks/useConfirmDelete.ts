import { useCallback } from 'react'
import { Alert } from 'react-native'
import { UI_TEXT, MESSAGES } from '../constants'
import { showSuccess, showError, getErrorMessage } from '../utils/notifications'

interface UseConfirmDeleteOptions<TArgs extends unknown[]> {
    /** Performs the deletion. */
    remove: (...args: TArgs) => Promise<void>
    /** Alert body shown before deleting. */
    confirmMessage: string
    /** Toast shown after a successful delete. */
    successMessage: string
    /** Called after a successful delete (e.g. reload the list). */
    onDeleted?: () => Promise<void> | void
}

/**
 * Shared "confirm dialog → delete → toast → refresh" flow used by list screens.
 * Returns a `confirm` callback to wire into a row's delete button.
 */
export function useConfirmDelete<TArgs extends unknown[]>({
    remove,
    confirmMessage,
    successMessage,
    onDeleted,
}: UseConfirmDeleteOptions<TArgs>) {
    return useCallback(
        (...args: TArgs) => {
            Alert.alert(UI_TEXT.DELETE_CONFIRM_TITLE, confirmMessage, [
                { text: UI_TEXT.CANCEL, style: 'cancel' },
                {
                    text: UI_TEXT.DELETE,
                    style: 'destructive',
                    onPress: () => {
                        ;(async () => {
                            try {
                                await remove(...args)
                                showSuccess(successMessage)
                                await onDeleted?.()
                            } catch (error) {
                                // DatabaseError carries a user-facing message
                                showError(getErrorMessage(error, MESSAGES.ERROR_GENERIC))
                            }
                        })()
                    },
                },
            ])
        },
        [remove, confirmMessage, successMessage, onDeleted]
    )
}
