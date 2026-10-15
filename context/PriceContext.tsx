import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { IPrice } from '../types/database'
import { NewPrice, priceService } from '../services/priceService'
import { getErrorMessage } from '../utils/errors'
import { showError } from '../utils/notifications'

interface PriceContextValue {
    prices: IPrice[]
    loading: boolean
    /** Last refresh failure; null after a successful load. Screens render a retry state from this. */
    error: unknown
    refresh: () => Promise<void>
    addPrice: (data: NewPrice) => Promise<number>
    editPrice: (id: number, data: Partial<NewPrice>) => Promise<void>
    removePrice: (id: number) => Promise<void>
}

const PriceContext = createContext<PriceContextValue | undefined>(undefined)

export function PriceProvider({ children }: { children: React.ReactNode }) {
    const [prices, setPrices] = useState<IPrice[]>([])
    // Start loading so consumers never flash their empty state before the
    // first load completes.
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<unknown>(null)
    // Monotonic token: only the most recent refresh call may commit its result,
    // so overlapping calls (tab focus + pull-to-refresh) cannot race.
    const refreshToken = useRef(0)
    const mounted = useRef(true)

    useEffect(() => {
        mounted.current = true
        return () => {
            mounted.current = false
        }
    }, [])

    const refresh = useCallback(async () => {
        const token = ++refreshToken.current
        setLoading(true)
        setError(null)
        try {
            const data = await priceService.getPrices()
            if (mounted.current && token === refreshToken.current) {
                setPrices(data)
            }
        } catch (err) {
            // Never propagate: every screen treats refresh() as fire-and-forget.
            if (token === refreshToken.current) {
                setError(err)
                showError(getErrorMessage(err))
            }
        } finally {
            if (mounted.current && token === refreshToken.current) {
                setLoading(false)
            }
        }
    }, [])

    const addPrice = useCallback(
        async (data: NewPrice) => {
            const id = await priceService.addPrice(data)
            await refresh()
            return id
        },
        [refresh]
    )

    const editPrice = useCallback(
        async (id: number, data: Partial<NewPrice>) => {
            await priceService.editPrice(id, data)
            await refresh()
        },
        [refresh]
    )

    const removePrice = useCallback(
        async (id: number) => {
            await priceService.removePrice(id)
            await refresh()
        },
        [refresh]
    )

    const value = useMemo(
        () => ({ prices, loading, error, refresh, addPrice, editPrice, removePrice }),
        [prices, loading, error, refresh, addPrice, editPrice, removePrice]
    )

    return <PriceContext.Provider value={value}>{children}</PriceContext.Provider>
}

export function usePrices(): PriceContextValue {
    const context = useContext(PriceContext)
    if (!context) {
        throw new Error('usePrices must be used within a PriceProvider')
    }
    return context
}
