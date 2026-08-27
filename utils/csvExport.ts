import { Share } from 'react-native'

export async function shareOrSaveCsv(csv: string, filename: string, title: string): Promise<'shared' | 'saved' | 'failed'> {
    // Try file-system save if react-native-fs is available (optional dep)
    try {
        const RNFS: any = (() => {
            try {
                // @ts-ignore optional dep
                return require('react-native-fs')
            } catch {
                return null
            }
        })()
        if (RNFS?.CachesDirectoryPath && RNFS?.writeFile) {
            const path = `${RNFS.CachesDirectoryPath}/${filename}`
            await RNFS.writeFile(path, csv, 'utf8')
            // If we saved, still offer Share with file URL where supported
            try {
                await Share.share({ message: csv, title, url: `file://${path}` } as any)
                return 'shared'
            } catch {
                return 'saved'
            }
        }
    } catch {
        // optional dep not installed — fall through to Share
    }

    try {
        await Share.share({ message: csv, title })
        return 'shared'
    } catch {
        return 'failed'
    }
}
