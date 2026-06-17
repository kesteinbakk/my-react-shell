/**
 * i18n context — intentionally minimal and stable.
 *
 * `createContext` and the public i18n types live here, isolated from the
 * effectful <I18nProvider>, so editing the provider does not re-run
 * `createContext` and mint a new context identity on hot reload. Keep this
 * module free of effects and component imports (mirrors themeContext).
 */

import { createContext, useContext } from 'react'
import type { TranslateParams } from './translate'

/** A locale code. Consumer-defined (`'en'`, `'en-US'`, `'nb-NO'`, …) — the module is locale-agnostic. */
export type Locale = string

/** A locale exposed to the app (e.g. for a language picker). */
export interface LocaleInfo {
  /** Stable code used as the messages key and in persistence. */
  code: Locale
  /** Human-readable label for language pickers. */
  label: string
}

/** The translation function. Resolves a (namespaced) key to a string. */
export type TFunction = (key: string, params?: TranslateParams) => string

export interface I18nContextValue {
  /** Translate a key in the active locale. */
  t: TFunction
  /** The active locale code. */
  locale: Locale
  /** Locales this app exposes. */
  locales: readonly LocaleInfo[]
  /** Switch the active locale (must be a configured locale). */
  setLocale: (locale: Locale) => void
}

export const I18nContext = createContext<I18nContextValue | null>(null)

/** Read the i18n context. Throws if used outside <I18nProvider>. */
export function useI18nContext(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18nContext must be used within <I18nProvider>')
  }
  return ctx
}
