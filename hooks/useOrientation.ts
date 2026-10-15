import { useWindowDimensions } from 'react-native'

/**
 * Shared orientation / responsive-layout hook.
 *
 * Portrait and landscape are derived from live window dimensions so every
 * screen re-renders automatically on rotation (Android already handles
 * configChanges; iOS needs landscape entries in Info.plist).
 *
 * Breakpoints:
 * - isLandscape: width > height
 * - isWide: landscape OR tablet-width portrait (>= 700pt)
 * - columns: 2 when landscape/wide, 1 otherwise — used by FlatList grids
 * - contentMaxWidth: centered reading width so full-bleed lists don't stretch
 *   edge-to-edge on wide/landscape screens
 */
export const RESPONSIVE = {
    WIDE_BREAKPOINT: 700,
    MAX_CONTENT_WIDTH_PORTRAIT: 640,
    MAX_CONTENT_WIDTH_LANDSCAPE: 960,
    MAX_SHEET_WIDTH: 560,
} as const

export function useOrientation() {
    const { width, height } = useWindowDimensions()
    const isLandscape = width > height
    const isPortrait = !isLandscape
    const isWide = isLandscape || width >= RESPONSIVE.WIDE_BREAKPOINT
    const columns = isWide ? 2 : 1
    const contentMaxWidth = isLandscape
        ? RESPONSIVE.MAX_CONTENT_WIDTH_LANDSCAPE
        : RESPONSIVE.MAX_CONTENT_WIDTH_PORTRAIT
    return {
        width,
        height,
        isLandscape,
        isPortrait,
        isWide,
        columns,
        contentMaxWidth,
    }
}

export type Orientation = ReturnType<typeof useOrientation>
