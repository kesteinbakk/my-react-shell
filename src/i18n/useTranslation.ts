/**
 * useTranslation — the public hook for translating and switching locale.
 *
 * A thin, stable wrapper over the i18n context. Pass a `namespace` to prepend
 * it to every key, so a feature can call `t('title')` instead of repeating its
 * prefix. All lifecycle (state, persistence, missing-key tracking) lives in
 * <I18nProvider>.
 *
 * `K` is the accepted key type and **defaults to `string`**, so
 * `useTranslation()` is unchanged. Bind `K` (most ergonomically via
 * `createTypedI18n`, or per-call here) to get a compile error on a bad key.
 *
 * Namespace narrowing lives in the **factory** (`createTypedI18n`), where the
 * key union is already bound so only the namespace needs inferring. On this
 * bare generic the returned `t` stays typed to the full `K` even when a
 * `namespace` is given (the namespace is applied at runtime) — binding both the
 * key union and the namespace per call would require partial type-argument
 * inference TypeScript does not support. Use the factory for namespaced typing.
 */

import { useMemo } from 'react'
import { useI18nContext } from './i18nContext'
import type { Locale, LocaleInfo, TFunction } from './i18nContext'

/**
 * The keys of `K` reachable under namespace `NS` — the suffixes left after
 * stripping `${NS}.`. For the default `string` key type this collapses to
 * `string` (a fully-permissive `t`). For a bound union it is the exact set of
 * valid sub-keys, so `t('title')` under namespace `'account'` is checked against
 * `account.title`. Used by `createTypedI18n`'s namespaced `useTranslation`.
 */
export type NamespacedKeys<K extends string, NS extends string> = string extends K
  ? string
  : K extends `${NS}.${infer Rest}`
    ? Rest
    : never

export interface UseTranslationResult<K extends string = string> {
  /** Translate a key (prefixed with `namespace` if one was given). */
  t: TFunction<K>
  /** The active locale code. */
  locale: Locale
  /** Locales this app exposes. */
  locales: readonly LocaleInfo[]
  /** Switch the active locale (must be a configured locale). */
  setLocale: (locale: Locale) => void
}

export function useTranslation<K extends string = string>(
  namespace?: string,
): UseTranslationResult<K> {
  const ctx = useI18nContext()
  const t = useMemo<TFunction>(() => {
    if (namespace === undefined) return ctx.t
    return (key, params) => ctx.t(`${namespace}.${key}`, params)
  }, [ctx.t, namespace])
  // The context translator is `string`-keyed; the bound `K` is a compile-time
  // view over the same runtime function.
  return {
    t: t as TFunction<K>,
    locale: ctx.locale,
    locales: ctx.locales,
    setLocale: ctx.setLocale,
  }
}

/** Alias mirroring foundation's naming. */
export { useTranslation as useI18n }
