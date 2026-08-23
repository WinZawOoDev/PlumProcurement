import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { IPrice } from '../database'
import { NewPrice, priceService } from '../services/priceService'

interface PriceContextValue {
    prices: IPrice[]
    loading: boolean
    refresh: () => Promise<void>
    addPrice: (data: NewPrice) => Promise<number>
    editPrice: (id: number, data: Partial<NewPrice>) => Promise<void>
    removePrice: (id: number) => Promise<void>
}

const PriceContext = createContext<PriceContextValue | undefined>(undefined)

export function PriceProvider({ children }: { children: React.ReactNode }) {
    const [prices, setPrices] = useState<IPrice[]>([])
    const [loading, setLoading] = useState(false)

    const refresh = useCallback(async () => {
        setLoading(true)
        try {
            const data = await priceService.getPrices()
            setPrices(data)
        } finally {
            setLoading(false)
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
        () => ({ prices, loading, refresh, addPrice, editPrice, removePrice }),
        [prices, loading, refresh, addPrice, editPrice, removePrice]
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
