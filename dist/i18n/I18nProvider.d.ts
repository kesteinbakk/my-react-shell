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
import type { ReactNode } from 'react';
import type { Locale, LocaleInfo } from './i18nContext';
import type { Messages, TranslateParams } from './translate';
export interface I18nProviderProps {
    children: ReactNode;
    /** Per-locale catalogs: locale code → nested message tree. At least one locale required. */
    messages: Record<Locale, Messages>;
    /** Locales to expose (e.g. for a language picker). Defaults to the `messages` keys, code as label. */
    locales?: readonly LocaleInfo[];
    /**
     * Locale used when nothing is persisted and browser detection finds no match.
     * Must be a key of `messages`. Defaults to the first `messages` key.
     */
    defaultLocale?: Locale;
    /** Locale whose catalog backs keys missing in the active locale. Defaults to the resolved default locale. */
    fallbackLocale?: Locale;
    /** Detect the initial locale from `navigator.language` when nothing is persisted. Default `true`. */
    detectBrowserLocale?: boolean;
    /** localStorage key for persistence. Default `'my-react-shell.locale'`. */
    storageKey?: string;
    /**
     * Bring-your-own translator. Given the active locale, key, and params, return
     * the translated string or `undefined` if absent (absence triggers the same
     * missing-key handling). Overrides the built-in catalog lookup.
     */
    resolve?: (locale: Locale, key: string, params?: TranslateParams) => string | undefined;
    /**
     * Called whenever the user switches locale (not on initial mount). Use it to
     * mirror the choice to a backend or per-user account; the provider keeps
     * persisting to localStorage regardless. Mirrors `<ThemeProvider onChange>`.
     */
    onChange?: (locale: Locale) => void;
    /** Called for every missing key (in addition to the built-in dev tracker). */
    onMissingKey?: (key: string, locale: Locale) => void;
    /** Force dev behaviors (missing-key tracking + console warnings). Defaults to `import.meta.env.DEV`. */
    debug?: boolean;
}
export declare function I18nProvider({ children, messages, locales: localesProp, defaultLocale, fallbackLocale: fallbackLocaleProp, detectBrowserLocale, storageKey, resolve, onChange, onMissingKey, debug, }: I18nProviderProps): import("react").JSX.Element;
