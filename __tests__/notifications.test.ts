import { showSuccess, showError, getErrorMessage } from '../utils/notifications'

describe('notifications', () => {
    test('showSuccess/showError do not throw', () => {
        expect(() => showSuccess('ok')).not.toThrow()
        expect(() => showError('fail')).not.toThrow()
    })

    test('getErrorMessage extracts message', () => {
        expect(getErrorMessage(new Error('boom'), 'fallback')).toBe('boom')
        expect(getErrorMessage('string', 'fallback')).toBe('fallback')
    })
})
