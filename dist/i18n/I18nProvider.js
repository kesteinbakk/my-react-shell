import { jsx as _jsx } from "react/jsx-runtime";
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { I18nContext } from './i18nContext';
import { flattenMessages, interpolate } from './translate';
import { localeMetaFor } from './localeMeta';
import { missingKeyStore } from './missingKeys';
import { setActiveTranslator } from './translateNow';
const DEFAULT_STORAGE_KEY = 'my-react-shell.locale';
function readPersistedLocale(storageKey) {
    try {
        return window.localStorage.getItem(storageKey);
    }
    catch {
        return null; // storage blocked (e.g. privacy mode)
    }
}
function detectBrowser(available) {
    if (typeof navigator === 'undefined')
        return null;
    const nav = navigator.language;
    if (!nav)
        return null;
    if (available.includes(nav))
        return nav;
    const prefix = nav.split('-')[0];
    const match = available.find((l) => l === prefix || l.split('-')[0] === prefix);
    return match ?? null;
}
export function I18nProvider({ children, messages, locales: localesProp, defaultLocale, fallbackLocale: fallbackLocaleProp, detectBrowserLocale = true, storageKey = DEFAULT_STORAGE_KEY, resolve, onChange, onMissingKey, debug, }) {
    const localeCodes = Object.keys(messages);
    if (localeCodes.length === 0) {
        throw new Error('my-react-shell: <I18nProvider> requires at least one locale in `messages`.');
    }
    if (defaultLocale !== undefined && !(defaultLocale in messages)) {
        throw new Error(`my-react-shell: <I18nProvider> defaultLocale "${defaultLocale}" is not a key of \`messages\` ` +
            `(have: ${localeCodes.join(', ')}).`);
    }
    if (fallbackLocaleProp !== undefined && !(fallbackLocaleProp in messages)) {
        throw new Error(`my-react-shell: <I18nProvider> fallbackLocale "${fallbackLocaleProp}" is not a key of \`messages\` ` +
            `(have: ${localeCodes.join(', ')}).`);
    }
    // First declared locale is a deliberate UI default, not a papered-over absent value.
    const resolvedDefault = defaultLocale ?? localeCodes[0];
    const fallbackLocale = fallbackLocaleProp ?? resolvedDefault;
    const isDebug = debug ?? import.meta.env.DEV;
    const dicts = useMemo(() => {
        const out = {};
        for (const code of Object.keys(messages)) {
            out[code] = flattenMessages(messages[code]);
        }
        return out;
    }, [messages]);
    // Default each locale's picker label to its native name (endonym) from the
    // shell's locale registry — so bare `messages={{ 'nb-NO':…, 'en-US':… }}`
    // yields a properly-labelled picker with no `locales` prop. Unknown codes fall
    // back to the raw code.
    const locales = useMemo(() => localesProp ??
        Object.keys(messages).map((code) => ({ code, label: localeMetaFor(code)?.nativeName ?? code })), [localesProp, messages]);
    const [locale, setLocaleState] = useState(() => {
        const persisted = readPersistedLocale(storageKey);
        if (persisted !== null && persisted in messages)
            return persisted;
        if (detectBrowserLocale) {
            const detected = detectBrowser(localeCodes);
            if (detected !== null)
                return detected;
        }
        return resolvedDefault;
    });
    // Persist (best-effort — storage may be unavailable).
    useEffect(() => {
        try {
            window.localStorage.setItem(storageKey, locale);
        }
        catch {
            /* ignore */
        }
    }, [locale, storageKey]);
    // Notify the consumer of locale changes (skipping initial mount) so it can
    // mirror the choice to a backend. Read `onChange` from a ref so this effect
    // depends only on `locale` — a new callback identity each render won't re-fire
    // it. Mirrors <ThemeProvider>.
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);
    const mountedRef = useRef(false);
    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            return;
        }
        onChangeRef.current?.(locale);
    }, [locale]);
    const t = useCallback((key, params) => {
        if (!key) {
            if (isDebug)
                console.warn('[i18n] empty translation key');
            return '';
        }
        let result;
        if (resolve) {
            result = resolve(locale, key, params);
        }
        else {
            const raw = dicts[locale]?.[key] ??
                (fallbackLocale !== locale ? dicts[fallbackLocale]?.[key] : undefined);
            result = raw === undefined ? undefined : interpolate(raw, params);
        }
        if (result === undefined) {
            if (isDebug) {
                missingKeyStore.add(key, locale);
                console.warn(`[i18n] missing key "${key}" for locale "${locale}"`);
                onMissingKey?.(key, locale);
            }
            return key;
        }
        return result;
    }, [locale, dicts, fallbackLocale, resolve, onMissingKey, isDebug]);
    // Publish the root translator for imperative `translateNow` callers.
    useEffect(() => {
        setActiveTranslator(t);
        return () => setActiveTranslator(null);
    }, [t]);
    const setLocale = useCallback((next) => {
        if (!(next in messages)) {
            if (isDebug) {
                console.warn(`[i18n] setLocale("${next}") ignored — not a configured locale.`);
            }
            return;
        }
        setLocaleState(next);
    }, [messages, isDebug]);
    const value = useMemo(() => ({ t, locale, locales, setLocale }), [t, locale, locales, setLocale]);
    return _jsx(I18nContext.Provider, { value: value, children: children });
}
