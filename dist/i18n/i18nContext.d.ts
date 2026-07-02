/**
 * i18n context — intentionally minimal and stable.
 *
 * `createContext` and the public i18n types live here, isolated from the
 * effectful <I18nProvider>, so editing the provider does not re-run
 * `createContext` and mint a new context identity on hot reload. Keep this
 * module free of effects and component imports (mirrors themeContext).
 */
import type { TranslateParams } from './translate';
/** A locale code. Consumer-defined (`'en'`, `'en-US'`, `'nb-NO'`, …) — the module is locale-agnostic. */
export type Locale = string;
/** A locale exposed to the app (e.g. for a language picker). */
export interface LocaleInfo {
    /** Stable code used as the messages key and in persistence. */
    code: Locale;
    /** Human-readable label for language pickers. */
    label: string;
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
export type TFunction<K extends string = string> = (key: K, params?: TranslateParams) => string;
export interface I18nContextValue<K extends string = string> {
    /** Translate a key in the active locale. */
    t: TFunction<K>;
    /** The active locale code. */
    locale: Locale;
    /** Locales this app exposes. */
    locales: readonly LocaleInfo[];
    /** Switch the active locale (must be a configured locale). */
    setLocale: (locale: Locale) => void;
}
export declare const I18nContext: import("react").Context<I18nContextValue<string> | null>;
/** Read the i18n context. Throws if used outside <I18nProvider>. */
export declare function useI18nContext(): I18nContextValue;
/**
 * Read the i18n context, returning `null` outside a provider (never throws).
 *
 * The null-safe variant powers **soft optional integration**: a component can
 * follow the app's locale when an `<I18nProvider>` is mounted and degrade
 * gracefully when it isn't (see `components/useShellText`, which falls back to
 * the shell's bundled catalog). Mirrors `useIconModeContextOptional`.
 */
export declare function useI18nContextOptional(): I18nContextValue | null;
