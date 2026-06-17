/**
 * useTranslation — the public hook for translating and switching locale.
 *
 * A thin, stable wrapper over the i18n context. Pass a `namespace` to prepend
 * it to every key, so a feature can call `t('title')` instead of repeating its
 * prefix. All lifecycle (state, persistence, missing-key tracking) lives in
 * <I18nProvider>.
 */

import { useMemo } from 'react'
import { useI18nContext } from './i18nContext'
import type { Locale, LocaleInfo, TFunction } from './i18nContext'

export interface UseTranslationResult {
  /** Translate a key (prefixed with `namespace` if one was given). */
  t: TFunction
  /** The active locale code. */
  locale: Locale
  /** Locales this app exposes. */
  locales: readonly LocaleInfo[]
  /** Switch the active locale (must be a configured locale). */
  setLocale: (locale: Locale) => void
}

export function useTranslation(namespace?: string): UseTranslationResult {
  const ctx = useI18nContext()
  const t = useMemo<TFunction>(() => {
    if (namespace === undefined) return ctx.t
    return (key, params) => ctx.t(`${namespace}.${key}`, params)
  }, [ctx.t, namespace])
  return { t, locale: ctx.locale, locales: ctx.locales, setLocale: ctx.setLocale }
}

/** Alias mirroring foundation's naming. */
export { useTranslation as useI18n }
