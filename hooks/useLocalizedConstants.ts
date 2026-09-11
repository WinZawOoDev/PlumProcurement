import { useTranslation } from 'react-i18next'
import {
  A11Y_LABELS as A11Y_LABELS_EN,
  CATEGORY_LIST as CATEGORY_LIST_EN,
  MESSAGES as MESSAGES_EN,
  PAYMENT_METHODS as PAYMENT_METHODS_EN,
  PRODUCT_CATEGORIES,
  TAB_LABELS as TAB_LABELS_EN,
  UI_TEXT as UI_TEXT_EN,
  VALIDATION_MESSAGES as VALIDATION_MESSAGES_EN,
} from '../constants'
import type { TranslationSchema } from '../i18n/resources/schema'
import '../i18n'

type CategoryValue = (typeof PRODUCT_CATEGORIES)[keyof typeof PRODUCT_CATEGORIES]

export interface LocalizedConstants {
  UI_TEXT: typeof UI_TEXT_EN
  MESSAGES: typeof MESSAGES_EN
  VALIDATION_MESSAGES: typeof VALIDATION_MESSAGES_EN
  A11Y_LABELS: typeof A11Y_LABELS_EN
  TAB_LABELS: typeof TAB_LABELS_EN
  PAYMENT_METHODS: typeof PAYMENT_METHODS_EN
  CATEGORY_LIST: typeof CATEGORY_LIST_EN
}

/**
 * Returns the shared constant dictionaries translated into the active language.
 *
 * The returned objects keep the exact shape of the English source constants, so
 * components can keep writing `UI_TEXT.SAVE` while staying reactive to language
 * changes.
 */
export function useLocalizedConstants(): LocalizedConstants {
  const { t } = useTranslation()

  const uiText = t('uiText', { returnObjects: true }) as TranslationSchema['uiText']
  const messages = t('messages', { returnObjects: true }) as TranslationSchema['messages']
  const validation = t('validation', { returnObjects: true }) as TranslationSchema['validation']
  const a11y = t('a11y', { returnObjects: true }) as TranslationSchema['a11y']
  const tabLabels = t('tabs', { returnObjects: true }) as TranslationSchema['tabs']

  const paymentMethods = PAYMENT_METHODS_EN.map((method) => ({
    label: t(`paymentMethods.${method.value}`),
    value: method.value,
  })) as unknown as typeof PAYMENT_METHODS_EN

  const categories = t('categories', { returnObjects: true }) as TranslationSchema['categories']
  const categoryList = CATEGORY_LIST_EN.map((item) => ({
    label: categories[item.value as CategoryValue],
    value: item.value,
  })) as unknown as typeof CATEGORY_LIST_EN

  return {
    UI_TEXT: uiText as typeof UI_TEXT_EN,
    MESSAGES: messages as typeof MESSAGES_EN,
    VALIDATION_MESSAGES: validation as typeof VALIDATION_MESSAGES_EN,
    A11Y_LABELS: a11y as typeof A11Y_LABELS_EN,
    TAB_LABELS: tabLabels as typeof TAB_LABELS_EN,
    PAYMENT_METHODS: paymentMethods,
    CATEGORY_LIST: categoryList,
  }
}
