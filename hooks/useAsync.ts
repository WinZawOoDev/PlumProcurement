import { useCallback, useState } from 'react'

interface UseAsyncOptions {
    onSuccess?: () => void
    onError?: (error: unknown) => void
}

export function useAsync(options?: UseAsyncOptions) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const execute = useCallback(
        async (operation: () => Promise<void>) => {
            setLoading(true)
            setError(null)
            try {
                await operation()
                options?.onSuccess?.()
            } catch (err: unknown) {
                setError(err)
                options?.onError?.(err)
                throw err
            } finally {
                setLoading(false)
            }
        },
        [options]
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
