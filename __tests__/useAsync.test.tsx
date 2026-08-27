// @ts-nocheck
import { renderHook, act } from '@testing-library/react-native'
import { useAsync, useLoading } from '../hooks/useAsync'

describe('useAsync', () => {
    test('toggles loading and handles success', async () => {
        const onSuccess = jest.fn()
        const { result } = renderHook(() => useAsync({ onSuccess }))
        expect(result.current.loading).toBe(false)

        await act(async () => {
            await result.current.execute(async () => {})
        })

        expect(onSuccess).toHaveBeenCalledTimes(1)
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeNull()
    })

    test('captures error and calls onError', async () => {
        const onError = jest.fn()
        const { result } = renderHook(() => useAsync({ onError }))
        const err = new Error('boom')

        await act(async () => {
            await expect(result.current.execute(async () => { throw err })).rejects.toThrow('boom')
        })

        expect(result.current.error).toBe(err)
        expect(onError).toHaveBeenCalledWith(err)
        expect(result.current.loading).toBe(false)
    })
})

describe('useLoading', () => {
    test('withLoading toggles loading', async () => {
        const { result } = renderHook(() => useLoading(false))
        expect(result.current.loading).toBe(false)

        let promise: Promise<void>
        act(() => {
            promise = result.current.withLoading(async () => {
                await new Promise((r) => setTimeout(r, 10))
            })
        })
        // loading should be true while promise pending
        expect(result.current.loading).toBe(true)
        await act(async () => {
            await promise
        })
        expect(result.current.loading).toBe(false)
    })
})
