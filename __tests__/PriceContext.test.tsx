import React, { useEffect } from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { PriceProvider, usePrices } from '../context/PriceContext'
import { priceService } from '../services/priceService'
import { IPrice } from '../database'

jest.mock('../services/priceService', () => ({
    priceService: {
        getPrices: jest.fn(),
        addPrice: jest.fn(),
        editPrice: jest.fn(),
        removePrice: jest.fn(),
    },
}))

const mockPrices: IPrice[] = [
    { id: 1, price: 3000, unit: 'PER KG', category: 'fruits', is_available: true },
]

type PriceState = ReturnType<typeof usePrices>

function Probe({ onState }: { onState: (state: PriceState) => void }) {
    const state = usePrices()
    useEffect(() => {
        onState(state)
    }, [state, onState])
    return null
}

async function renderProvider(onState: (state: PriceState) => void) {
    let renderer!: ReactTestRenderer.ReactTestRenderer
    await act(async () => {
        renderer = ReactTestRenderer.create(
            <PriceProvider>
                <Probe onState={onState} />
            </PriceProvider>
        )
    })
    return renderer
}

beforeEach(() => {
    jest.clearAllMocks()
})

test('refresh loads prices and clears loading state', async () => {
    ;(priceService.getPrices as jest.Mock).mockResolvedValue(mockPrices)

    const states: PriceState[] = []
    await renderProvider((s) => states.push(s))
    await act(async () => {
        await states[states.length - 1].refresh()
    })

    expect(priceService.getPrices).toHaveBeenCalled()
    const last = states[states.length - 1]
    expect(last.prices).toEqual(mockPrices)
    expect(last.loading).toBe(false)
})

test('addPrice delegates to service then refreshes the list', async () => {
    ;(priceService.addPrice as jest.Mock).mockResolvedValue(2)
    ;(priceService.getPrices as jest.Mock).mockResolvedValue([
        ...mockPrices,
        { id: 2, price: 100, unit: 'PER UNIT', category: 'dairy', is_available: false },
    ])

    const states: PriceState[] = []
    await renderProvider((s) => states.push(s))
    await act(async () => {})
    await act(async () => {
        await states[states.length - 1].addPrice({
            price: 100,
            unit: 'PER UNIT',
            category: 'dairy',
            is_available: false,
        })
    })

    expect(priceService.addPrice).toHaveBeenCalledWith({
        price: 100,
        unit: 'PER UNIT',
        category: 'dairy',
        is_available: false,
    })
    expect(states[states.length - 1].prices).toHaveLength(2)
})

test('editPrice delegates to service then refreshes the list', async () => {
    ;(priceService.editPrice as jest.Mock).mockResolvedValue(undefined)
    ;(priceService.getPrices as jest.Mock).mockResolvedValue(mockPrices)

    const states: PriceState[] = []
    await renderProvider((s) => states.push(s))
    await act(async () => {})
    await act(async () => {
        await states[states.length - 1].editPrice(1, { price: 3500 })
    })

    expect(priceService.editPrice).toHaveBeenCalledWith(1, { price: 3500 })
    expect(states[states.length - 1].prices).toEqual(mockPrices)
})

test('removePrice delegates to service then refreshes the list', async () => {
    ;(priceService.removePrice as jest.Mock).mockResolvedValue(undefined)
    ;(priceService.getPrices as jest.Mock).mockResolvedValue([])

    const states: PriceState[] = []
    await renderProvider((s) => states.push(s))
    await act(async () => {})
    await act(async () => {
        await states[states.length - 1].removePrice(1)
    })

    expect(priceService.removePrice).toHaveBeenCalledWith(1)
    expect(states[states.length - 1].prices).toEqual([])
})
