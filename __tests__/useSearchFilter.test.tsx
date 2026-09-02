import React, { useEffect } from 'react'
import ReactTestRenderer, { act } from 'react-test-renderer'
import { useSearchFilter } from '../hooks/useSearchFilter'

type Probe = ReturnType<typeof useSearchFilter<{ id: number; name: string }>>

let latest: Probe | null = null

const Harness = ({ items }: { items: Array<{ id: number; name: string }> }) => {
    const state = useSearchFilter(items, (item, q) => item.name.toLowerCase().includes(q))
    useEffect(() => {
        latest = state
    })
    return null
}

const render = async (items: Array<{ id: number; name: string }>) => {
    let root!: ReactTestRenderer.ReactTestRenderer
    await act(async () => {
        root = ReactTestRenderer.create(<Harness items={items} />)
    })
    return root
}

describe('useSearchFilter', () => {
    const items = [
        { id: 1, name: 'U Ba' },
        { id: 2, name: 'Daw Mya' },
    ]

    test('returns all items when search is closed', async () => {
        await render(items)
        expect(latest!.filtered).toEqual(items)
        expect(latest!.visible).toBe(false)
        expect(latest!.hasQuery).toBe(false)
    })

    test('toggle shows the search and clears the query on close', async () => {
        await render(items)
        act(() => latest!.toggle())
        expect(latest!.visible).toBe(true)
        act(() => latest!.setQuery('ba'))
        expect(latest!.hasQuery).toBe(true)
        expect(latest!.filtered).toEqual([{ id: 1, name: 'U Ba' }])
        act(() => latest!.toggle())
        expect(latest!.visible).toBe(false)
        expect(latest!.query).toBe('')
        expect(latest!.filtered).toEqual(items)
    })

    test('filters case-insensitively', async () => {
        await render(items)
        act(() => latest!.toggle())
        act(() => latest!.setQuery('DAW'))
        expect(latest!.filtered).toEqual([{ id: 2, name: 'Daw Mya' }])
        act(() => latest!.setQuery('   '))
        expect(latest!.filtered).toEqual(items)
    })
})
