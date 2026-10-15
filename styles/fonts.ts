import { Platform } from 'react-native'

/** Slightly reduce Burmese text size to balance its taller glyphs with Latin text. */
export const MYANMAR_FONT_SIZE_SCALE = 0.9

export function scaleMyanmarFontSize(fontSize: number): number {
    return Math.max(1, Math.round(fontSize * MYANMAR_FONT_SIZE_SCALE))
}

/**
 * Noto Sans Myanmar is bundled under `assets/fonts` for Myanmar script support.
 * Android resolves custom fonts by file name, iOS by the font's family name.
 */
export const MYANMAR_FONT_FAMILY = Platform.select({
    ios: 'Noto Sans Myanmar',
    default: 'NotoSansMyanmar_400Regular',
}) as string

export const MYANMAR_FONT_FAMILY_BOLD = Platform.select({
    ios: 'Noto Sans Myanmar',
    default: 'NotoSansMyanmar_700Bold',
}) as string

const BOLD_WEIGHTS = new Set(['bold', '600', '700', '800', '900'])

export function isBoldWeight(weight: unknown): boolean {
    return typeof weight === 'string' && BOLD_WEIGHTS.has(weight)
}
