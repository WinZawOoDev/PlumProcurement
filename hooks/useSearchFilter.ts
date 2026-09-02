import { useCallback, useMemo, useRef, useState } from 'react'

/**
 * Shared search state for list screens: visibility toggle (clears the query
 * on close), the query itself, and a memoized filtered list.
 * The predicate is stored in a ref so inline definitions don't rememoize.
 */
export function useSearchFilter<T>(
    items: T[],
    predicate: (item: T, query: string) => boolean
) {
    const [visible, setVisible] = useState(false)
    const [query, setQuery] = useState('')
    const predicateRef = useRef(predicate)
    predicateRef.current = predicate

    const toggle = useCallback(() => {
        setVisible((prev) => {
            if (prev) setQuery('')
            return !prev
        })
    }, [])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return items
        return items.filter((item) => predicateRef.current(item, q))
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
