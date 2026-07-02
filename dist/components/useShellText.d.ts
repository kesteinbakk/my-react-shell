/**
 * useShellText — the component kit's built-in chrome copy.
 *
 * Returns `st(key)`, a translator for the shell's own `mrs.*` strings (Close,
 * Cancel, OK, …). This is what lets a kit component ship a *translated* default
 * instead of forcing the consumer to pass every obvious label:
 *
 *   const st = useShellText()
 *   <button aria-label={closeLabel ?? st('mrs.action.close')}>…</button>
 *
 * Resolution:
 *   1. the active `<I18nProvider>` (respects the current locale **and** any
 *      consumer override of an `mrs.*` key merged in via `withShellCatalog` /
 *      `AppProviders({ i18n })` / `createProjectI18n`), else
 *   2. the shell's **bundled** catalog for the active locale, ultimately the
 *      default locale (English) — so chrome always renders even with no provider
 *      mounted, and standalone component use never breaks.
 *
 * This is the i18n-core dependency the `components` module is allowed to take
 * (see docs/maintainers/module-authoring.md → "Self-contained"): a soft context
 * read plus a hard dependency on the shell's own bundled catalog data.
 */
import type { TranslateParams } from '../i18n/translate';
export type ShellText = (key: string, params?: TranslateParams) => string;
export declare function useShellText(): ShellText;
