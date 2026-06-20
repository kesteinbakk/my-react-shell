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
import { useTranslation as useTranslationBase } from './useTranslation';
import { translateNow as translateNowBase } from './translateNow';
/**
 * Bind the shell's i18n read side to a key union `K`. Returns typed
 * `{ useTranslation, useT, translateNow }`. Types only — same runtime as the
 * untyped hooks.
 */
export function createTypedI18n() {
    // The runtime is a single plain hook (`namespace` applied at runtime by the
    // base hook); the *type* is the overloaded call signature from `TypedI18n<K>`.
    // Typing the value with that signature — rather than an overloaded function
    // declaration — keeps `K` bound while only the namespace is inferred, with no
    // overload-vs-implementation incompatibility and no `any`.
    const useTranslation = ((namespace) => useTranslationBase(namespace));
    const useT = () => useTranslationBase().t;
    const translateNow = (key, params) => translateNowBase(key, params);
    return { useTranslation, useT, translateNow };
}
