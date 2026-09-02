import { Platform, ToastAndroid } from 'react-native'
import Toast from 'react-native-toast-message'

/**
 * Cross-platform notifications.
 * Android keeps the native Toast; iOS uses react-native-toast-message
 * (rendered from the app root) since ToastAndroid is a no-op there.
 */
export function showSuccess(message: string): void {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT)
        return
    }
    Toast.show({
        type: 'success',
        text1: message,
        position: 'bottom',
        visibilityTime: 2000,
    })
}

export function showError(message: string): void {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG)
        return
    }
    Toast.show({
        type: 'error',
        text1: message,
        position: 'bottom',
        visibilityTime: 3500,
    })
}

export function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message
    // DatabaseError extends Error, so above already handles it; keep fallback for non-Error throws
    return fallback
}
