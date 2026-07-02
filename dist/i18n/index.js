// my-react-shell/i18n — the i18n module (sub-path `my-react-shell/i18n`).
//
// A self-contained, zero-dependency `t()` seam: a provider + hook, a pure
// translator core, the central-key contract, and a dev-only missing-key
// surface. Convex-free and router-free; lives at a sub-path so the package
// barrel stays the theme core. Default flavor = pass `messages`, use
// `useTranslation()`; bring-your-own = `<I18nProvider resolve={…}>` or satisfy
// the exported contract. See docs/guides/i18n.md.
// ── provider + hook ───────────────────────────────────────────────────────────
export { I18nProvider } from './I18nProvider';
export { useTranslation, useI18n } from './useTranslation';
export { useI18nContext, useI18nContextOptional } from './i18nContext';
// ── locale metadata + bundled shell chrome catalog ────────────────────────────
export { LOCALE_META, localeMetaFor } from './localeMeta';
export { SHELL_CATALOG, DEFAULT_SHELL_LOCALE, withShellCatalog } from './shellCatalog';
// ── typed keys (opt-in, compile-time) ─────────────────────────────────────────
export { createTypedI18n } from './createTypedI18n';
export { createProjectI18n } from './createProjectI18n';
// ── imperative translation ────────────────────────────────────────────────────
export { translateNow } from './translateNow';
// ── translator core (pure) ────────────────────────────────────────────────────
export { flattenMessages, interpolate, mergeMessages } from './translate';
// ── dev missing-key surface ───────────────────────────────────────────────────
export { MissingTranslationsOverlay } from './MissingTranslationsOverlay';
export { missingKeyStore } from './missingKeys';
