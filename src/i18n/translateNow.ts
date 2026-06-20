/**
 * Imperative translation for callers outside React render — event handlers,
 * toast/error helpers, anything not inside a component. Inside components use
 * `useTranslation().t`, which re-renders on locale change.
 *
 * <I18nProvider> registers its root translator here while mounted; `translateNow`
 * reads it. With no provider mounted it returns the key unchanged (same
 * fallback shape as `t`). Assumes a single active <I18nProvider> (the usual
 * app-wide case) — the most recently mounted provider wins.
 */

import type { TFunction } from './i18nContext'
import type { TranslateParams } from './translate'

let active: TFunction | null = null

/** Internal — <I18nProvider> calls this to publish/retract its translator. */
export function setActiveTranslator(translator: TFunction | null): void {
  active = translator
}

/**
 * Imperative translate. `K` is the accepted key type and **defaults to `string`**,
 * so `translateNow('x')` is unchanged. The factory (`createTypedI18n`) re-exports
 * a `K`-bound `translateNow` so imperative callers get the same compile-time key
 * safety as the hook. Narrowing is compile-time only — one runtime translator.
 */
export function translateNow<K extends string = string>(key: K, params?: TranslateParams): string {
  if (active === null) return key
  return active(key, params)
}
