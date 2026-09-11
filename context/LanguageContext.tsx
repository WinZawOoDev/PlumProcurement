import { createContext, useContext } from 'react'
import { DEFAULT_LANGUAGE, Language } from '../constants'

export interface LanguageContextValue {
    language: Language
    setLanguage: (language: Language) => void
}

export const LanguageContext = createContext<LanguageContextValue>({
    language: DEFAULT_LANGUAGE,
    setLanguage: () => undefined,
})

export function useLanguage(): LanguageContextValue {
    return useContext(LanguageContext)
}
