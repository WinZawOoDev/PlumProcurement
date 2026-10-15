import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Shared search state for list screens: visibility toggle (clears the query
 * on close), the query itself, and a memoized filtered list.
 * The predicate is stored in a ref so inline definitions don't rememoize.
 *
 * Omit `predicate` for screens that filter server-side — `filtered` then
 * mirrors `items` and only visibility/query/toggle state is used.
 */
export function useSearchFilter<T>(
    items: T[],
    predicate?: (item: T, query: string) => boolean
) {
    const [visible, setVisible] = useState(false)
    const [query, setQuery] = useState('')
    // Written in an effect, never during render.
    const predicateRef = useRef(predicate)
    useEffect(() => {
        predicateRef.current = predicate
    })

    const toggle = useCallback(() => {
        // setState-in-updater is a side effect: clear the query via the
        // visibility flag instead, applied after the toggle commits.
        setVisible((prev) => !prev)
    }, [])

    // Clearing the query when the bar closes (runs after render commits).
    const wasVisible = useRef(visible)
    useEffect(() => {
        if (wasVisible.current && !visible) {
            setQuery('')
        }
        wasVisible.current = visible
    }, [visible])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q || !predicateRef.current) return items
        return items.filter((item) => predicateRef.current!(item, q))
    }, [items, query])

    return {
        visible,
        query,
        setQuery,
        toggle,
        filtered,
        hasQuery: query.trim().length > 0,
    }
}
