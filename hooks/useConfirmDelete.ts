import { useCallback } from 'react'
import { Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
import { showSuccess, showError } from '../utils/notifications'
import { getErrorMessage } from '../utils/errors'

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
    const { t } = useTranslation()
    return useCallback(
        (...args: TArgs) => {
            Alert.alert(t('uiText.DELETE_CONFIRM_TITLE'), confirmMessage, [
                { text: t('uiText.CANCEL'), style: 'cancel' },
                {
                    text: t('uiText.DELETE'),
                    style: 'destructive',
                    onPress: () => {
                        ;(async () => {
                            try {
                                await remove(...args)
                            } catch (error) {
                                // DatabaseError carries a user-facing message;
                                // anything else becomes the generic message.
                                showError(getErrorMessage(error))
                                return
                            }
                            showSuccess(successMessage)
                            // A refresh failure after a successful delete is its
                            // own error — it must not read as "delete failed".
                            try {
                                await onDeleted?.()
                            } catch (refreshError) {
                                showError(getErrorMessage(refreshError))
                            }
                        })()
                    },
                },
            ])
        },
        [t, remove, confirmMessage, successMessage, onDeleted]
    )
}
