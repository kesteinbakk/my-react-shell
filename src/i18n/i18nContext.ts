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

/**
 * The translation function. Resolves a (namespaced) key to a string.
 *
 * `K` is the accepted key type — it **defaults to `string`**, so the untyped
 * seam (`t('any.dotted.key')`) is unchanged. A consumer binds `K` to its own
 * key union (directly, or via `createTypedI18n<K>()`) to make a bad key a
 * compile error. Narrowing `K` never changes the runtime — the context always
 * carries a `string`-keyed translator; the bound type is a compile-time view.
 */
export type TFunction<K extends string = string> = (key: K, params?: TranslateParams) => string

export interface I18nContextValue<K extends string = string> {
  /** Translate a key in the active locale. */
  t: TFunction<K>
  /** The active locale code. */
  locale: Locale
  /** Locales this app exposes. */
  locales: readonly LocaleInfo[]
  /** Switch the active locale (must be a configured locale). */
  setLocale: (locale: Locale) => void
}

// The context identity is untyped (`string`-keyed); the hooks/factory narrow the
// read view to a bound `K`. One context, one runtime value — never re-created per
// key type.
export const I18nContext = createContext<I18nContextValue | null>(null)

/** Read the i18n context. Throws if used outside <I18nProvider>. */
export function useI18nContext(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18nContext must be used within <I18nProvider>')
  }
  return ctx
}
