/**
 * localeMeta — per-locale display metadata for the language selector.
 *
 * The single source of truth for each shipped locale's short code, native name
 * (endonym), and flag art. `<LanguagePicker>` derives its list from this
 * registry, and `<I18nProvider>` defaults a locale's picker label to its
 * `nativeName` here. Pure data — no React, no CSS — so the i18n module stays a
 * zero-dependency core (the flag *renderer* lives in the components module).
 *
 * Flags are vendored inline (3:2 SVG, sourced from country-flag-icons, MIT) so
 * the shell carries no runtime flag dependency — nothing to install downstream.
 *
 * To add a locale: paste its 3:2 flag SVG, add a `LOCALE_META` entry
 * (code + nativeName + flagSvg), ship its `common-<code>.json` chrome catalog,
 * and register it in `shellCatalog.ts`.
 */
export interface LocaleMeta {
    /** Short uppercase code shown in the picker's `code` trigger variant. */
    code: string;
    /** The language's own name (endonym) — shown as the picker label; needs no translation. */
    nativeName: string;
    /** Inline 3:2 flag SVG markup. */
    flagSvg: string;
}
/** Per-locale metadata for the shell's shipped locales. Extend when adding a locale. */
export declare const LOCALE_META: Record<string, LocaleMeta>;
/** Look up a locale's metadata (undefined for a consumer locale the shell doesn't know). */
export declare function localeMetaFor(code: string): LocaleMeta | undefined;
