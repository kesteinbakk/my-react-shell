# T032 — no-default-text props

**Status:** archived · **Branch:** main
**Superseded (for chrome) by [T034](../T034-i18n-core-module-language-picker/task.md):**
T034 makes i18n a core module and gives components built-in *translated* chrome defaults
(Close/Cancel/OK/… via the shell `mrs.*` catalog), so those labels are optional-with-default
again. T032's guarantee still holds for **content** (titles, data labels — still mandatory
props); it is only reversed for **chrome**, which now defaults to a translated string, never
raw English. The bug T032 fixed (English "Cancel" under Norwegian copy) stays fixed: chrome
follows the active locale when a provider is mounted.

## Why

A consumer reported a `ConfirmDialog` rendering an English **"Cancel"** beneath
Norwegian copy. Root cause: many shell components shipped **hardcoded English text
defaults** (`cancelLabel = 'Cancel'`, `confirmLabel = 'Confirm'`, placeholders,
aria-label fallbacks, `ActionButton` preset labels), violating `CLAUDE.md` → *No
hardcoded user-facing text in components*. A missing translation leaked English instead
of failing loudly or showing nothing.

## Rule applied (full-compliance sweep)

A component never renders a hardcoded language. Every user-facing string is a consumer
prop with **no language default and no language fallback**. Absent → nothing, or an
icon/emoji — never an English word. Three shapes:

- **Visible reading text + the accessible name of an always-rendered button → required**
  (TS-enforced).
- **Accessible name of an *opt-in* button → required only when that feature is on**
  (discriminated union — can't enable the button without naming it).
- **Supplementary aria-label on an icon/emoji control → optional, no default** (absent →
  the icon stands alone).
- **Non-language defaults stay** — an emoji/icon default is fine (`EmojiPicker`
  `searchPlaceholder='🔍'`, `noResultsLabel='🤷'`).

Enforcement is **TypeScript-level only** — no runtime throws were added.

## Changes

**Required props (no default):** `ConfirmDialog` `confirmLabel`/`cancelLabel`; `Dialog`
& `Sheet` `closeLabel`; `DatePicker` & `Select` `placeholder`; all `UserPreferences`
labels (except `description`); `ColorPicker` `hexLabel`; `EmojiPicker` `categoriesLabel`
/`frequentLabel`; `ToastProvider` `dismissLabel`.

**Discriminated union (required when feature on):** `Chip` `removeLabel` (`onRemove`);
`Alert` `dismissLabel` (`onDismiss`); `DropdownMenu` `iconTriggerLabel` (`iconTrigger`).

**Optional, no default (icon affordance):** card `dragHandleLabel`
(DynamicGridCard/StatCard/ContentCard/PaperCard/PhiCard); `PhiCard` `menuLabel`; `Table`
`empty`; app-shell `ScrollableTabRow` scroll-arrow labels via new
`ShellChromeLabels.scrollTabsLeft`/`scrollTabsRight`.

**Removed English:** `ActionButton` preset labels dropped entirely + `showLabel` prop
retired (and `PageHeaderPresetAction.showLabel`); app-shell chrome aria-label fallbacks
(`?? 'Home'`/`'Open menu'`/`'Main navigation'`/`'Breadcrumb'`/`'More'`) and
`ColorPicker` `?? 'Colors'`/`?? 'Hex color'` removed.

Internal wrappers updated: `Toast` (split auto-dismiss vs dismissible branch + forward
`dismissLabel`), `PhiCardMenu` label optional, `DynamicCardGrid` sort `Select`
`placeholder=""` (never shown).

Exempt: the dev-only `MissingTranslationsOverlay` (developer tool, never ships to end
users).

## Verification

- `pnpm typecheck` clean; `pnpm build:lib` clean; `dist/` rebuilt.
- Final grep over shipped `src/` (excl. dev overlay + harness) shows **zero** residual
  user-facing English literals or `?? 'English'` fallbacks.
- Demo (`my-react-shell-demo`) call sites migrated — typecheck clean.
- Consumer (`offansk-ev`) call sites migrated via its i18n seam — see report.

## Docs

API reference + `components` guide (new *No hardcoded user-facing text* section) +
`card-grid` and `app-shell` guides updated in lockstep.
