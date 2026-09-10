import { useCallback, useRef, useState } from 'react'

interface UseAsyncOptions {
    onSuccess?: () => void
    onError?: (error: unknown) => void
}

export function useAsync(options?: UseAsyncOptions) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)
    // Keep the latest callbacks in a ref so `execute` stays referentially stable
    // even when callers pass inline option objects.
    const optionsRef = useRef(options)
    optionsRef.current = options

    const execute = useCallback(
        async (operation: () => Promise<void>) => {
            setLoading(true)
            setError(null)
            try {
                await operation()
                optionsRef.current?.onSuccess?.()
            } catch (err: unknown) {
                setError(err)
                optionsRef.current?.onError?.(err)
                throw err
            } finally {
                setLoading(false)
            }
        },
        []
    )

    return { loading, error, execute, setLoading, setError }
}

export function useLoading(initial = false) {
    const [loading, setLoading] = useState(initial)
    const withLoading = useCallback(
        async <T,>(fn: () => Promise<T>): Promise<T> => {
            setLoading(true)
            try {
                return await fn()
            } finally {
                setLoading(false)
            }
        },
        []
    )
    return { loading, setLoading, withLoading }
}
