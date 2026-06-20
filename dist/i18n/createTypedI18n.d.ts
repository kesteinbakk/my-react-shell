/**
 * createTypedI18n — opt-in compile-time key safety, as pure typing sugar.
 *
 * Declare once, binding a key union `K`:
 *
 * ```ts
 * import { createTypedI18n } from 'my-react-shell/i18n'
 * import type { DictKey } from './catalog' // your key union (a flat union, or DotPaths<typeof en>)
 *
 * export const { useTranslation, useT, translateNow } = createTypedI18n<DictKey>()
 * ```
 *
 * Every call site is then typed with **zero per-call ceremony** — a bad key is a
 * compile error, a good key resolves to `string`. This mirrors react-i18next's
 * `createTypedHooks` and TanStack's typed router: one declaration, no type arg to
 * forget at each of the call sites (the bare-generic alternative silently
 * degrades to `string` when a type arg is omitted).
 *
 * It is a **thin typed wrapper over the existing generic hooks** — no new
 * context, no new runtime, nothing mounted. The returned functions ARE
 * `useTranslation` / `translateNow`, narrowed to `K`. The single
 * `<I18nProvider>` still owns all lifecycle.
 *
 * Catalog-derived keys: pass `DotPaths<typeof en>` as `K` to derive the union
 * from a nested catalog type instead of maintaining a separate union.
 */
import type { NamespacedKeys, UseTranslationResult } from './useTranslation';
import type { TFunction } from './i18nContext';
import type { TranslateParams } from './translate';
/** The typed i18n surface returned by `createTypedI18n<K>()`. */
export interface TypedI18n<K extends string> {
    /**
     * Locale-aware translate + locale controls, with `t` typed to `K`. With a
     * `namespace`, `t` is narrowed to the keys of `K` under that namespace
     * (`t('title')` under `'account'` is checked against `account.title`).
     */
    useTranslation: {
        (): UseTranslationResult<K>;
        <NS extends string>(namespace: NS): UseTranslationResult<NamespacedKeys<K, NS>>;
    };
    /**
     * No-namespace convenience: returns the bound `t` directly (the common case),
     * mirroring foundation/evaluering ergonomics. Equivalent to
     * `useTranslation().t`.
     */
    useT: () => TFunction<K>;
    /** Imperative translate for callers outside render, bound to `K`. */
    translateNow: (key: K, params?: TranslateParams) => string;
}
/**
 * Bind the shell's i18n read side to a key union `K`. Returns typed
 * `{ useTranslation, useT, translateNow }`. Types only — same runtime as the
 * untyped hooks.
 */
export declare function createTypedI18n<K extends string>(): TypedI18n<K>;
