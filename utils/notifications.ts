import { Platform, ToastAndroid } from 'react-native'

export function showSuccess(message: string): void {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT)
    }
}

export function showError(message: string): void {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG)
    }
}

export function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message
    // DatabaseError extends Error, so above already handles it; keep fallback for non-Error throws
    return fallback
}
