/**
 * Diagnostic regression test for: "after creating a price from the add form,
 * it doesn't display in the price list view".
 *
 * Runs the REAL PriceContext + priceService + database/prices stack against
 * an in-memory fake of react-native-nitro-sqlite that actually persists rows
 * (bootstrap reports user_version 8 so migrations are skipped).
 */
import React, { useEffect } from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { PriceProvider, usePrices } from '../context/PriceContext'

// The fake lives in its own module (typed) and is required lazily so the
// mock factory references no out-of-scope variables.
jest.mock('react-native-nitro-sqlite', () => require('../testHelpers/inMemorySqlite'))

type PriceState = ReturnType<typeof usePrices>

function Probe({ onState }: { onState: (state: PriceState) => void }) {
    const state = usePrices()
    useEffect(() => {
        onState(state)
    }, [state, onState])
    return null
}

test('a price created via addPrice appears in context state after refresh', async () => {
    const states: PriceState[] = []
    await act(async () => {
        ReactTestRenderer.create(
            <PriceProvider>
                <Probe onState={(s) => states.push(s)} />
            </PriceProvider>
        )
    })
    await act(async () => {})

    // Initial load: empty.
    expect(states[states.length - 1].prices).toEqual([])

    // The exact user flow: create then rely on addPrice's internal refresh.
    let insertId = -1
    await act(async () => {
        insertId = await states[states.length - 1].addPrice({
            price: 100,
            unit: 'GALLON',
            category: 'seed',
        })
    })

    expect(insertId).toBeGreaterThan(0)
    expect(states[states.length - 1].prices).toEqual([
        expect.objectContaining({ price: 100, unit: 'GALLON', category: 'seed' }),
    ])
})
