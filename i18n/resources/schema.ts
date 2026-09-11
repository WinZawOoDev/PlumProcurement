import {
  A11Y_LABELS,
  MESSAGES,
  PRODUCT_CATEGORIES,
  TAB_LABELS,
  UI_TEXT,
  VALIDATION_MESSAGES,
} from '../../constants'

type CategoryValue = (typeof PRODUCT_CATEGORIES)[keyof typeof PRODUCT_CATEGORIES]

/**
 * Translation shape derived from the English source constants. Locale files
 * implement this interface so a missing/extra key fails type-checking.
 */
export interface TranslationSchema {
  tabs: Record<keyof typeof TAB_LABELS, string>
  uiText: Record<keyof typeof UI_TEXT, string>
  messages: Record<keyof typeof MESSAGES, string>
  validation: Record<keyof typeof VALIDATION_MESSAGES, string>
  a11y: Record<keyof typeof A11Y_LABELS, string>
  categories: Record<CategoryValue, string>
  paymentMethods: {
    cash: string
    bank: string
    mobile: string
  }
  onboarding: {
    pricesTitle: string
    pricesDescription: string
    purchasesTitle: string
    purchasesDescription: string
    sellersTitle: string
    sellersDescription: string
    next: string
    getStarted: string
    skip: string
    goToSlide: string
  }
}
