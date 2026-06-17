/**
 * I18nProvider
 *
 * Owns locale state and the translation function. It pre-flattens each locale's
 * catalog, resolves keys against the active locale (falling back to
 * `fallbackLocale`), records misses in dev, and persists the locale to
 * localStorage. SPA-only (no SSR, per D2). Mirrors <ThemeProvider>'s shape.
 *
 * Default flavor: pass `messages` and use `useTranslation()`. Bring-your-own:
 * pass `resolve` to delegate to another i18n runtime (ICU, react-i18next, …)
 * while keeping this provider's locale state, persistence, and missing-key
 * surface; or ignore this provider entirely and satisfy the exported contract.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { I18nContext } from './i18nContext'
import type { I18nContextValue, Locale, LocaleInfo, TFunction } from './i18nContext'
import { flattenMessages, interpolate } from './translate'
import type { FlatMessages, Messages, TranslateParams } from './translate'
import { missingKeyStore } from './missingKeys'
import { setActiveTranslator } from './translateNow'

const DEFAULT_STORAGE_KEY = 'my-react-shell.locale'

export interface I18nProviderProps {
  children: ReactNode
  /** Per-locale catalogs: locale code → nested message tree. At least one locale required. */
  messages: Record<Locale, Messages>
  /** Locales to expose (e.g. for a language picker). Defaults to the `messages` keys, code as label. */
  locales?: readonly LocaleInfo[]
  /**
   * Locale used when nothing is persisted and browser detection finds no match.
   * Must be a key of `messages`. Defaults to the first `messages` key.
   */
  defaultLocale?: Locale
  /** Locale whose catalog backs keys missing in the active locale. Defaults to the resolved default locale. */
  fallbackLocale?: Locale
  /** Detect the initial locale from `navigator.language` when nothing is persisted. Default `true`. */
  detectBrowserLocale?: boolean
  /** localStorage key for persistence. Default `'my-react-shell.locale'`. */
  storageKey?: string
  /**
   * Bring-your-own translator. Given the active locale, key, and params, return
   * the translated string or `undefined` if absent (absence triggers the same
   * missing-key handling). Overrides the built-in catalog lookup.
   */
  resolve?: (locale: Locale, key: string, params?: TranslateParams) => string | undefined
  /** Called for every missing key (in addition to the built-in dev tracker). */
  onMissingKey?: (key: string, locale: Locale) => void
  /** Force dev behaviors (missing-key tracking + console warnings). Defaults to `import.meta.env.DEV`. */
  debug?: boolean
}

function readPersistedLocale(storageKey: string): Locale | null {
  try {
    return window.localStorage.getItem(storageKey)
  } catch {
    return null // storage blocked (e.g. privacy mode)
  }
}

function detectBrowser(available: readonly Locale[]): Locale | null {
  if (typeof navigator === 'undefined') return null
  const nav = navigator.language
  if (!nav) return null
  if (available.includes(nav)) return nav
  const prefix = nav.split('-')[0]
  const match = available.find((l) => l === prefix || l.split('-')[0] === prefix)
  return match ?? null
}

export function I18nProvider({
  children,
  messages,
  locales: localesProp,
  defaultLocale,
  fallbackLocale: fallbackLocaleProp,
  detectBrowserLocale = true,
  storageKey = DEFAULT_STORAGE_KEY,
  resolve,
  onMissingKey,
  debug,
}: I18nProviderProps) {
  const localeCodes = Object.keys(messages)
  if (localeCodes.length === 0) {
    throw new Error('my-react-shell: <I18nProvider> requires at least one locale in `messages`.')
  }
  if (defaultLocale !== undefined && !(defaultLocale in messages)) {
    throw new Error(
      `my-react-shell: <I18nProvider> defaultLocale "${defaultLocale}" is not a key of \`messages\` ` +
        `(have: ${localeCodes.join(', ')}).`,
    )
  }
  if (fallbackLocaleProp !== undefined && !(fallbackLocaleProp in messages)) {
    throw new Error(
      `my-react-shell: <I18nProvider> fallbackLocale "${fallbackLocaleProp}" is not a key of \`messages\` ` +
        `(have: ${localeCodes.join(', ')}).`,
    )
  }
  // First declared locale is a deliberate UI default, not a papered-over absent value.
  const resolvedDefault = defaultLocale ?? (localeCodes[0] as Locale)
  const fallbackLocale = fallbackLocaleProp ?? resolvedDefault
  const isDebug = debug ?? import.meta.env.DEV

  const dicts = useMemo<Record<Locale, FlatMessages>>(() => {
    const out: Record<Locale, FlatMessages> = {}
    for (const code of Object.keys(messages)) {
      out[code] = flattenMessages(messages[code] as Messages)
    }
    return out
  }, [messages])

  const locales = useMemo<readonly LocaleInfo[]>(
    () => localesProp ?? Object.keys(messages).map((code) => ({ code, label: code })),
    [localesProp, messages],
  )

  const [locale, setLocaleState] = useState<Locale>(() => {
    const persisted = readPersistedLocale(storageKey)
    if (persisted !== null && persisted in messages) return persisted
    if (detectBrowserLocale) {
      const detected = detectBrowser(localeCodes)
      if (detected !== null) return detected
    }
    return resolvedDefault
  })

  // Persist (best-effort — storage may be unavailable).
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, locale)
    } catch {
      /* ignore */
    }
  }, [locale, storageKey])

  const t = useCallback<TFunction>(
    (key, params) => {
      if (!key) {
        if (isDebug) console.warn('[i18n] empty translation key')
        return ''
      }
      let result: string | undefined
      if (resolve) {
        result = resolve(locale, key, params)
      } else {
        const raw =
          dicts[locale]?.[key] ??
          (fallbackLocale !== locale ? dicts[fallbackLocale]?.[key] : undefined)
        result = raw === undefined ? undefined : interpolate(raw, params)
      }
      if (result === undefined) {
        if (isDebug) {
          missingKeyStore.add(key, locale)
          console.warn(`[i18n] missing key "${key}" for locale "${locale}"`)
          onMissingKey?.(key, locale)
        }
        return key
      }
      return result
    },
    [locale, dicts, fallbackLocale, resolve, onMissingKey, isDebug],
  )

  // Publish the root translator for imperative `translateNow` callers.
  useEffect(() => {
    setActiveTranslator(t)
    return () => setActiveTranslator(null)
  }, [t])

  const setLocale = useCallback(
    (next: Locale) => {
      if (!(next in messages)) {
        if (isDebug) {
          console.warn(`[i18n] setLocale("${next}") ignored — not a configured locale.`)
        }
        return
      }
      setLocaleState(next)
    },
    [messages, isDebug],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ t, locale, locales, setLocale }),
    [t, locale, locales, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
