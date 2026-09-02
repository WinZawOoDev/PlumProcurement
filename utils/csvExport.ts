import { Share } from 'react-native'

/**
 * Share CSV text via the native share sheet.
 * Previously tried react-native-fs as an optional dep, but Metro resolves
 * literal requires at bundle time, so the missing dep broke production builds.
 */
export async function shareOrSaveCsv(csv: string, filename: string, title: string): Promise<'shared' | 'failed'> {
    try {
        await Share.share({ message: csv, title: `${title} — ${filename}` })
        return 'shared'
    } catch {
        return 'failed'
    }
}
