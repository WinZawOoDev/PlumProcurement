import { useCallback } from 'react'
import { Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
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
                                showSuccess(successMessage)
                                await onDeleted?.()
                            } catch (error) {
                                // DatabaseError carries a user-facing message
                                showError(getErrorMessage(error, t('messages.ERROR_GENERIC')))
                            }
                        })()
                    },
                },
            ])
        },
        [t, remove, confirmMessage, successMessage, onDeleted]
    )
}
