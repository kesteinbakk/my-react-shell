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
import { useMemo } from 'react';
import { useI18nContext } from './i18nContext';
export function useTranslation(namespace) {
    const ctx = useI18nContext();
    const t = useMemo(() => {
        if (namespace === undefined)
            return ctx.t;
        return (key, params) => ctx.t(`${namespace}.${key}`, params);
    }, [ctx.t, namespace]);
    // The context translator is `string`-keyed; the bound `K` is a compile-time
    // view over the same runtime function.
    return {
        t: t,
        locale: ctx.locale,
        locales: ctx.locales,
        setLocale: ctx.setLocale,
    };
}
/** Alias mirroring foundation's naming. */
export { useTranslation as useI18n };
