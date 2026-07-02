# T034 — i18n as a core module: built-in component chrome copy + language picker

**Status:** in-progress
**Supersedes:** T032 (no-default-text-props) for *chrome* copy — see below.

## Problem

Every user-facing string a component emits is a **mandatory consumer prop** (enforced by
T032). A consumer must therefore pass obvious chrome — "Close", "Cancel", "OK", "Dismiss"
— to every dialog, alert, chip, and menu, in every app. There is also no shipped way to
*switch* app language: `I18nProvider` already mirrors `ThemeProvider` (locales, default,
browser-detection, persistence, `setLocale`) and the shell already ships `common-en/nb`
catalogs merged by `createProjectI18n`, but nothing consumes it, there is no picker, and
`AppProviders` does not compose it.

## Goal

Make i18n a **core (mandatory) module**: components carry **built-in translated defaults**
for their own chrome from a shell-shipped catalog, that a consumer merges its catalogs
onto and can override. Make **language selection as smooth as theme selection** — a
shipped `<LanguagePicker>` and a reserved "Language" section in `UserPreferences`.

## Decisions (approved)

1. **No-provider fallback** — components read the i18n context *softly* (the
   soft-optional-integration pattern) and fall back to the shell's **bundled
   default-locale catalog**, so they always render and standalone use still works.
   "Mandatory" = shipped + wired + composed by default, not "throw if unmounted".
2. **Picker labels** — **native names (endonyms)** + **flag SVGs on by default** (vendored
   inline SVG, no runtime dep).
3. **Locale codes** — **regioned** `nb-NO` / `en-US`.

## Relationship to T032

T032 removed default text and made every string a mandatory prop, to prevent untranslated
English leaking into apps. T034 keeps that guarantee for **content** (titles, data labels
— still mandatory props) but **reverses it for chrome** (Close/Cancel/OK/…): the shell now
owns translated chrome copy centrally, so a missing prop yields a *translated* default,
not raw English. T033 already established the precedent that a component may ship default
button text (`ConfirmDialog` OK).

## Plan (phases A–E)

See `~/.claude/plans/tranquil-sparking-cloud.md` (approved). Summary:

- **A — i18n core foundation:** `localeMeta.ts` (`LOCALE_META` + `<Flag>`), regioned
  catalog rename, curate to `mrs.*` chrome namespace, `useI18nContextOptional()`,
  provider meta-defaults + `onChange` + deferred `loadCatalog` seam, `AppProviders.i18n`.
- **B — chrome-text hook + migration:** internal `useShellText.ts`; mandatory chrome props
  → optional-with-`mrs.*`-default across ~11 components; content props stay mandatory.
- **C — picker:** `LanguagePicker.tsx` (DropdownMenu radio-group; flag + native name;
  checkmark; trigger variants) + reserved `id:'language'` section in `UserPreferences`.
- **D — docs & rules:** reverse the no-hardcoded-text rule + declare i18n core in
  CLAUDE.md / concept.md; update guides/i18n.md, guides/components.md, api-reference; mark
  T032 superseded.
- **E — demo:** stand up i18n in `my-react-shell-demo`, real Language section, picker
  showcase, drop redundant label props; typecheck + build + browser-verify.

## Verification

`pnpm typecheck` + `pnpm build:lib` (shell) → `pnpm typecheck` (demo). Browser: dialogs
show "Close"/"Cancel" with no label props; Language section lists Norsk + English with
flags + active checkmark; switching flips built-in chrome and persists across reload;
components still render English with no `<I18nProvider>` mounted.

## Follow-ups

- Consumers passing `nb`/`en` or holding an old persisted locale fall back once and need a
  codes bump (evaluering) — separate repo, needs approval.
