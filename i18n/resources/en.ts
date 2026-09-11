import {
  A11Y_LABELS,
  MESSAGES,
  TAB_LABELS,
  UI_TEXT,
  VALIDATION_MESSAGES,
} from '../../constants'
import type { TranslationSchema } from './schema'

/**
 * English is the source-of-truth locale: it reuses the app constants directly
 * so it can never drift from the keys used throughout the codebase.
 */
export const en: TranslationSchema = {
  tabs: TAB_LABELS,
  uiText: UI_TEXT,
  messages: MESSAGES,
  validation: VALIDATION_MESSAGES,
  a11y: A11Y_LABELS,
  categories: {
    fruit: 'Fruit',
    seed: 'Seed',
  },
  paymentMethods: {
    cash: 'Cash',
    bank: 'Bank transfer',
    mobile: 'Mobile money',
  },
  onboarding: {
    pricesTitle: 'Manage Prices',
    pricesDescription: 'Define market rates per category and unit in seconds.',
    purchasesTitle: 'Record Purchases',
    purchasesDescription: 'Pick a price, choose a seller, set quantity — total auto-calculates.',
    sellersTitle: 'Track Sellers',
    sellersDescription: 'Keep your seller directory with purchase stats at a glance.',
    next: 'Next',
    getStarted: 'Get Started',
    skip: 'Skip',
    goToSlide: 'Go to slide {{index}}',
  },
}
