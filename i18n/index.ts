import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, LANGUAGES, Language } from '../constants';
import { toMyanmarDigits } from '../utils/digits';
import { en } from './resources/en';
import { my } from './resources/my';

export const resources = {
  en: { translation: en },
  my: { translation: my },
} as const;

/**
 * Converts Western digits inside translated strings to Myanmar digits when the
 * active language is Myanmar. This only touches `t()` output (rendered text),
 * never stored numbers, and is guarded so `returnObjects` results pass through
 * untouched. It also covers numbers interpolated into translations, e.g.
 * `{{count}}`/`{{avg}}` in summaries and accessibility labels.
 */
const myanmarDigitsPostProcessor = {
  type: 'postProcessor' as const,
  name: 'myanmarDigits',
  process(value: unknown) {
    return typeof value === 'string' && i18n.language === 'my'
      ? toMyanmarDigits(value)
      : value;
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(myanmarDigitsPostProcessor)
    .use(initReactI18next)
    .init({
      resources,
      lng: DEFAULT_LANGUAGE,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: [...LANGUAGES],
      interpolation: { escapeValue: false },
      returnNull: false,
      compatibilityJSON: 'v4',
      initImmediate: false,
      postProcess: ['myanmarDigits'],
    })
}

/** Translates a message key (without the `messages.` prefix). */
export function tMessage(key: string): string {
  return i18n.t(`messages.${key}`)
}

/** Coerces an arbitrary value into a supported language, defaulting to English. */
export function normalizeLanguage(value: string | null | undefined): Language {
  return LANGUAGES.includes(value as Language)
    ? (value as Language)
    : DEFAULT_LANGUAGE;
}

/** Best-effort device language detection used when the user has not chosen one. */
export function getDeviceLanguage(): Language {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return normalizeLanguage(locale?.split('-')[0]);
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function changeLanguage(language: Language): Promise<unknown> {
  return i18n.changeLanguage(language);
}

export default i18n;
