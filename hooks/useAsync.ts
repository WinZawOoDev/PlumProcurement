import { useState, useCallback } from 'react'
import { ToastAndroid } from 'react-native'
import { MESSAGES } from '../constants'

interface AsyncState<T> {
    data: T | null
    loading: boolean
    error: Error | null
}

type AsyncFunction<T> = () => Promise<T>

/**
 * Hook to handle async operations with loading and error states
 * Automatically shows toast notifications for errors
 */
export function useAsync<T>(
    asyncFunction: AsyncFunction<T>,
    immediate = true,
    onSuccess?: (data: T) => void
) {
    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        loading: immediate,
        error: null,
    })

    const execute = useCallback(async () => {
        setState({ data: null, loading: true, error: null })
        try {
            const response = await asyncFunction()
            setState({ data: response, loading: false, error: null })
            onSuccess?.(response)
            return response
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error))
            setState({ data: null, loading: false, error: err })
            ToastAndroid.show(err.message || MESSAGES.ERROR_GENERIC, ToastAndroid.LONG)
            throw err
        }
    }, [asyncFunction, onSuccess])

    // Execute immediately if requested
    if (immediate && state.loading) {
        execute().catch(() => {
            // Error already handled and shown
        })
    }

    return { ...state, execute }
}

/**
 * Hook to track loading state for a single operation
 */
export function useLoading(initial = false) {
    const [loading, setLoading] = useState(initial)

    const withLoading = useCallback(
        async (fn: () => Promise<void>) => {
            try {
                setLoading(true)
                await fn()
            } catch (error) {
                throw error
            } finally {
                setLoading(false)
            }
        },
        []
    )

    return { loading, setLoading, withLoading }
}

/**
 * Hook to handle form submission with loading and error states
 */
export function useFormSubmit<T>(
    onSubmit: (data: T) => Promise<void>,
    onSuccess?: () => void
) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const handleSubmit = useCallback(
        async (data: T) => {
            setLoading(true)
            setError(null)
            try {
                await onSubmit(data)
                onSuccess?.()
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err))
                setError(error)
                ToastAndroid.show(error.message || MESSAGES.ERROR_GENERIC, ToastAndroid.LONG)
            } finally {
                setLoading(false)
            }
        },
        [onSubmit, onSuccess]
    )

    return { loading, error, handleSubmit }
}
