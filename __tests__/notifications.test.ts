import { showSuccess, showError } from '../utils/notifications'
import { getErrorMessage } from '../utils/errors'
import { DatabaseError } from '../services/errors'
import { MESSAGES } from '../constants'

describe('notifications', () => {
    test('showSuccess/showError do not throw', () => {
        expect(() => showSuccess('ok')).not.toThrow()
        expect(() => showError('fail')).not.toThrow()
    })
})

describe('getErrorMessage', () => {
    test('returns the DatabaseError message as-is (already localized)', () => {
        expect(getErrorMessage(new DatabaseError(MESSAGES.ERROR_NOT_FOUND))).toBe(
            MESSAGES.ERROR_NOT_FOUND
        )
    })

    test('replaces internal errors with the generic message', () => {
        expect(getErrorMessage(new Error('boom'))).toBe(MESSAGES.ERROR_GENERIC)
        expect(getErrorMessage('string')).toBe(MESSAGES.ERROR_GENERIC)
        expect(getErrorMessage(null)).toBe(MESSAGES.ERROR_GENERIC)
        expect(getErrorMessage(new DatabaseError(''))).toBe(MESSAGES.ERROR_GENERIC)
    })
})
