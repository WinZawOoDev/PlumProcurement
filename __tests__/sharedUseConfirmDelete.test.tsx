import { Alert } from 'react-native'
import { renderHook, act } from '@testing-library/react-native'
import { useConfirmDelete } from '../hooks/useConfirmDelete'
import { MESSAGES } from '../constants'
import { DatabaseError } from '../services/errors'

const pressButton = async (buttonText: string) => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    const call = alertSpy.mock.calls[0]
    const buttons = call[2] as Array<{ text: string; onPress?: () => void }>
    const button = buttons.find((b) => b.text === buttonText)!
    await act(async () => {
        await button.onPress?.()
    })
    return alertSpy
}

describe('useConfirmDelete', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(Alert, 'alert').mockImplementation(() => {})
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('delete success shows the success toast and runs onDeleted', async () => {
        const remove = jest.fn().mockResolvedValue(undefined)
        const onDeleted = jest.fn().mockResolvedValue(undefined)
        const showSuccessSpy = jest.spyOn(require('../utils/notifications'), 'showSuccess')

        const { result } = renderHook(() =>
            useConfirmDelete({ remove, confirmMessage: 'Sure?', successMessage: 'Gone', onDeleted })
        )
        await act(async () => {
            result.current(3)
        })
        const alertSpy = await pressButton('Delete')

        expect(Alert.alert).toHaveBeenCalledWith(
            expect.anything(),
            'Sure?',
            expect.anything()
        )
        expect(remove).toHaveBeenCalledWith(3)
        expect(showSuccessSpy).toHaveBeenCalledWith('Gone')
        expect(onDeleted).toHaveBeenCalledTimes(1)
        expect(alertSpy).toBeDefined()
        showSuccessSpy.mockRestore()
    })

    test('delete failure shows the backend message and skips onDeleted', async () => {
        const remove = jest.fn().mockRejectedValue(new DatabaseError(MESSAGES.ERROR_PRICE_IN_USE))
        const onDeleted = jest.fn()
        const showErrorSpy = jest.spyOn(require('../utils/notifications'), 'showError')

        const { result } = renderHook(() =>
            useConfirmDelete({ remove, confirmMessage: 'Sure?', successMessage: 'Gone', onDeleted })
        )
        await act(async () => {
            result.current(3)
        })
        await pressButton('Delete')

        expect(showErrorSpy).toHaveBeenCalledWith(MESSAGES.ERROR_PRICE_IN_USE)
        expect(onDeleted).not.toHaveBeenCalled()
        showErrorSpy.mockRestore()
    })

    test('an onDeleted failure does not read as a delete failure', async () => {
        const remove = jest.fn().mockResolvedValue(undefined)
        const onDeleted = jest.fn().mockRejectedValue(new Error('refresh broke'))
        const showSuccessSpy = jest.spyOn(require('../utils/notifications'), 'showSuccess')
        const showErrorSpy = jest.spyOn(require('../utils/notifications'), 'showError')

        const { result } = renderHook(() =>
            useConfirmDelete({ remove, confirmMessage: 'Sure?', successMessage: 'Gone', onDeleted })
        )
        await act(async () => {
            result.current(3)
        })
        await pressButton('Delete')

        // Success toast first (the delete worked), then the refresh error.
        expect(showSuccessSpy).toHaveBeenCalledWith('Gone')
        expect(showErrorSpy).toHaveBeenCalledWith(MESSAGES.ERROR_GENERIC)
        showSuccessSpy.mockRestore()
        showErrorSpy.mockRestore()
    })
})
