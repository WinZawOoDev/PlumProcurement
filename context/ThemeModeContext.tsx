import { createContext, useContext } from 'react'
import { ThemeMode } from '../constants'

export interface ThemeModeContextValue {
    mode: ThemeMode
    setMode: (mode: ThemeMode) => void
}

export const ThemeModeContext = createContext<ThemeModeContextValue>({
    mode: 'system',
    setMode: () => undefined,
})

export function useThemeMode(): ThemeModeContextValue {
    return useContext(ThemeModeContext)
}
