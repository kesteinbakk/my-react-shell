/**
 * shellCatalog — the shell's own bundled chrome catalog (the `mrs.*` namespace).
 *
 * This is the content that makes i18n a **core** module: components read their
 * built-in copy (Close, Cancel, OK, …) from here, so a missing label prop yields
 * a *translated* default rather than raw English, and a component still renders
 * correct chrome even with no `<I18nProvider>` mounted (the bundled fallback in
 * `components/useShellText`).
 *
 * Adding a locale = ship its `common-<code>.json`, register it here, and add a
 * `localeMeta` entry. The `mrs.*` namespace is reserved for the shell; a consumer
 * catalog merges on top (`withShellCatalog`) and may override any `mrs.*` key.
 */
import type { FlatMessages, Messages } from './translate';
import type { Locale } from './i18nContext';
/** The locale whose bundled catalog backs every `mrs.*` key when nothing better resolves. */
export declare const DEFAULT_SHELL_LOCALE = "en-US";
/** The shell's bundled chrome catalogs, per shipped locale (nested form). */
export declare const SHELL_CATALOG: Record<Locale, Messages>;
/** The same catalogs pre-flattened to dotted keys — the fast path for `useShellText`. */
export declare const SHELL_CATALOG_FLAT: Record<Locale, FlatMessages>;
/**
 * Merge the shell's bundled chrome catalog **under** a consumer's `messages`, per
 * locale (the consumer always wins), so every configured locale resolves the
 * `mrs.*` keys. For a consumer locale the shell doesn't ship (e.g. `fr-FR`), the
 * default-locale shell catalog is merged so chrome still resolves (in English)
 * until the consumer supplies its own `mrs.*` translations.
 */
export declare function withShellCatalog(messages: Record<Locale, Messages>): Record<Locale, Messages>;
