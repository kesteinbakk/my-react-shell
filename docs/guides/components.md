# components module

The deep-dive companion to the component kit. The
[API reference](../specifications/api-reference.md)
stays lean — every export, its props, and a minimal usage snippet. **This guide carries
the longer prose**: the conventions every component shares, the behaviour of the more
involved components, and the cross-cutting patterns. For the **card** components and the
two grids, read the dedicated [card guide](card-grid.md) instead.

```ts
import { Alert, cn /* … */ } from 'my-react-shell/components'
import 'my-react-shell/components/styles.css' // plus the theme tokens via my-react-shell/styles.css
```

The kit is the **complete** UI surface — the un-opinionated primitives (Button, Input,
Textarea, Label, Card, Separator, Skeleton, Checkbox, Switch, RadioGroup, Dialog, Popover,
DropdownMenu, Tabs, Tooltip, …) **and** the opinionated composites (Alert, ConfirmDialog,
Toast, Table, Select, ActionButton, Badge, the cards, …) — all built directly on Radix +
the theme tokens, so a consumer needs **no shadcn**.

## Semantic colour is one shared vocabulary

The kit exports a canonical **`Tone`** type
(`primary`·`neutral`·`info`·`success`·`warning`·`danger`) and its **`TONE_COLOR`**
`--color-*` map. Two conventions hold across the whole kit:

- **`tone`** carries *semantic colour*. Every `tone` prop uses `Tone` or a documented
  narrowing of it — `Alert` and `Toast` drop `primary`/`neutral` (a neutral note is
  `InfoBox`). `ConfirmDialog` takes the full `Tone` set: the tone colours a leading icon
  and the confirm button (which stays `primary` except for `danger`/`warning`).
- **`variant`** is reserved for *structural* style only (e.g. `Collapsible`, `Accordion`,
  `Button`) — never colour.

Components are themed **only through the semantic tokens**: change a token in your palette
and the whole kit follows, with no component edits. Never hardcode a colour.

## No hardcoded user-facing text — every string is a consumer prop

A shell component **never** renders a hardcoded language. It has no access to a consumer's
i18n, so **every** visible or audible string it emits — button text, placeholders,
empty-state labels, `aria-label`s, `title` tooltips — comes from the consumer as a prop,
with **no language default and no language fallback**. If a string isn't supplied, the
component shows **nothing, or an icon/emoji** — never an English word. This is why you saw
`confirmLabel`/`cancelLabel`, `closeLabel`, `placeholder`, `dismissLabel` and friends become
**props you must pass**. The rule, in three shapes:

- **Visible reading text, and the accessible name of an always-rendered button** → a
  **required** prop (TypeScript flags a missing one). Examples: `Dialog`/`Sheet`
  `closeLabel`, `Select`/`DatePicker` `placeholder`, every `UserPreferences` label,
  `ColorPicker` `hexLabel`, `EmojiPicker` `categoriesLabel`/`frequentLabel`,
  `ToastProvider` `dismissLabel`.
- **The accessible name of an *opt-in* button** (rendered only when you enable a feature)
  → **required only when that feature is on**, via a discriminated union — so you can't
  enable the button without naming it, and you're never forced to name a button that isn't
  there. Examples: `Chip` `removeLabel` (with `onRemove`), `Alert` `dismissLabel` (with
  `onDismiss`), `DropdownMenu` `iconTriggerLabel` (with `iconTrigger`).
- **A supplementary `aria-label` on a control whose meaning a visible icon already carries**
  → an **optional** prop, no default; if you omit it the icon stands alone (no language).
  Examples: the cards' `dragHandleLabel`, `PhiCard` `menuLabel`. Pass them anyway to keep
  the control accessible.

The **only** kind of default a component may carry is a non-language one: an **emoji or
icon** (e.g. `EmojiPicker`'s `searchPlaceholder` defaults to `🔍`, `noResultsLabel` to `🤷`).
Those props stay optional. A hardcoded English (or any-language) default is **never**
acceptable — a missing translation must surface as a type error or a silent icon, never as
the wrong language leaking through (e.g. an English "Cancel" under Norwegian copy).

> **Sole exception — `ConfirmDialog`'s button labels.** `ConfirmDialog` may ship a
> hardcoded English `OK` (confirm) and `Cancel` (opt-in cancel). It's the one deliberately
> approved carve-out: a bare acknowledgement is universal enough to warrant a batteries-
> included default, so `confirmLabel` and `cancelLabel` are **optional**. Pass a translated
> `confirmLabel`/`cancelLabel` for any localised app; the defaults exist only so a quick
> confirm needs zero wiring. No other component may hardcode language text.

> **`ActionButton` carries no preset text.** The presets (`add`, `delete`, …) ship a glyph,
> an emoji, and a colour — **no label**. Pass a translated `label` (visible) and/or
> `aria-label`/`hint` (accessible name). With none, the button is icon-only and **unnamed** —
> so always give a non-decorative action a name. (There is no `showLabel` prop.)

## Width & styling conventions

All input and form components (`Input`, `Textarea`, `Select`, `Checkbox`, `Switch`,
`RadioGroup`, `SegmentedControl`, `ColorPicker`, `DatePicker`, `Slider`) support custom
layout sizing and styling out of the box:

- **`className`** — set classes (Tailwind width utilities like `w-64`, `w-80`, `w-full`, or
  your own CSS) directly on the component's root or trigger element.
- **`style`** — standard React inline styles (`style?: CSSProperties`) on the same root or
  trigger element.

```tsx
// className (e.g. Tailwind):
<Select className="w-80" options={options} value={value} onValueChange={setValue} />
<Input className="w-96" placeholder="Custom width input…" />

// inline styles:
<DatePicker style={{ width: '250px' }} value={date} onChange={setDate} />
<Slider style={{ width: '200px' }} value={[volume]} onValueChange={([v]) => setVolume(v)} />
<Textarea style={{ width: '400px', height: '150px' }} placeholder="Custom textarea size…" />
```

## Required fields & validation — shell-owned, never native

Mandatory form controls carry a **red asterisk** and are validated by the **shell**, not the
browser. `Input`, `Textarea`, `InputField`, and `Select` take a **`required`** prop that:

- renders a red `*` after the built-in `label` (decorative, `aria-hidden`),
- sets **`aria-required`** on the control (so assistive tech announces it), and
- **does not set the native `required` attribute** — so the browser's native validation
  bubble (*"Please fill out this field"*, unstyleable and in the browser's own language)
  **never appears**. Validation UX is entirely yours.

The red asterisk is a static "this is mandatory" marker; it is **not** an error state — an
empty required field is not painted red on load (the classic native `:invalid` anti-pattern).
The error border is separate and **controlled**: you flip `invalid` (`Input`/`Textarea`) or
`error` (`InputField`) from your own validation, typically on submit.

For the common "**red border once the user leaves an empty required field**" behaviour, opt in
with **`validateOnBlur`** instead of wiring it yourself. It mirrors the CSS `:user-invalid`
timing — the border turns red only *after* a blur on an empty field, and clears the instant a
value is typed — but is implemented in the shell (no native constraint, no bubble). It is
**OR-ed** with the controlled `invalid`/`error`, which always wins, so it never fights a form
library that owns the error state.

```tsx
// Mandatory field: red asterisk + aria-required, no native bubble, red border on blur-empty:
<Input label={t('field.email')} required validateOnBlur fullWidth />
<Textarea label={t('field.bio')} required validateOnBlur fullWidth />
<Select label={t('field.role')} required validateOnBlur placeholder={t('field.pickRole')}
  options={roleOptions} value={role} onValueChange={setRole} />

// Marker only — you own the error state (e.g. a form library sets `invalid` on submit):
<Input label={t('field.email')} required invalid={submitted && !email} fullWidth />
```

`InputField`'s `validateOnBlur` shows only the red border (no message text — the shell can't
hardcode language); pass `error` for a translated message. Toggles (`Checkbox`/`Switch`) accept
native `required` for form wiring but render no asterisk — a marker on a single toggle reads oddly.

## Surfaces & elevation

Kit components render on the semantic **surface ladder** (full definition in the
[theme guide](theme.md#the-surface-ladder)); each role maps to one token:

- **`surface-primary`** — the default card / panel fill: `PhiCard`, `StatCard`, the
  `InputField` / `Select` field, the `ColorPicker` trigger, the active `SegmentedControl`
  item, the `Accordion` `bordered` / `separated` container.
- **`surface-raised`** — floating chrome that lifts above the card: `ConfirmDialog`,
  `UserPreferences`, the `Select` menu, the `ColorPicker` popover, the `PhiCard` overflow
  menu.
- **`surface-sunken`** — recessed inset regions (a well below the card): `InfoBox` /
  neutral `Alert`, `Chip`, the `Table` header + zebra rows, the `SegmentedControl` track,
  the `filled` `Collapsible` trigger.
- **`surface-sunken-deep`** — a deeper recess, for filled neutral elements: neutral
  `Badge`, `Avatar`.

Cards and floating chrome also carry a real **elevation** — kit-local box-shadow geometry
over the palette's `--color-shadow-*` shade, so depth tracks light/dark and a card reads as
a lifted layer instead of sitting flat: a soft lift for cards (deeper on hover) and a
stronger ambient for floating chrome (dialogs, menus, toasts). The geometry is
kit-internal (`--mrs-elevation-*`), not a public token.

## `ActionButton` — header-band layout

The `vertical` default (glyph over label) is for standalone toolbars and action grids. An
`ActionButton` placed in the **page-header band**'s `actions` slot (via
`usePageHeader({ actions })`) always renders **inline** (glyph before label) regardless of
`layout` — the app-shell stylesheet overrides it, because a stacked label blows out the
header band's height. Pass `layout="inline"` there anyway for clarity; icon-only actions
are unaffected.

`ActionButton` forwards all native `<button>` attributes and its `ref` to the `<button>`,
so it works directly as a Radix `asChild` trigger (a `Popover` / `Tooltip` / `DropdownMenu`
anchor) with no wrapper element.

```tsx
<ActionButtonGroup>
  <ActionButton action="add" label={t('action.add')} onClick={onAdd} />
  <ActionButton action="delete" aria-label={t('action.delete')} showEmoji={useIconMode().isEmoji} onClick={onDelete} />
  <ActionButton action="star" active={isFavorite} aria-label={t('action.favorite')} onClick={toggleFavorite} />
  <ActionButton icon={<Upload size={20} />} label={t('action.import')} tone="info" onClick={onImport} />
</ActionButtonGroup>
```

## `CopyButton` — copy with a built-in confirmation

`CopyButton` is a thin composite over `ActionButton` for the ubiquitous copy-to-clipboard
action, so you don't re-implement the write + the "copied!" feedback each time. Click →
`navigator.clipboard.writeText(value)` → the glyph swaps from 📋 to a green **check** and the
tone goes `success` for `copiedDuration` (default 1500 ms), then it returns to idle. It reuses
`ActionButton`'s styling wholesale — no new tokens, no new CSS — so `size`, `layout`,
`showEmoji`, and `tone` behave exactly as they do there.

It follows the kit's **no-hardcoded-text** rule (above): the `label` is optional (icon-only when
omitted — pass an `aria-label`/`hint` for a non-decorative action), and there is no language
default. Pass a `copiedLabel` to swap the visible text on success; omit it and the check alone is
the confirmation. Because a shell component can't reach your i18n or raise a toast, a **failed**
copy (insecure context, denied permission, no Clipboard API) is surfaced only through the
`onCopy(ok)` callback — hook your own error toast there; a success is shown inline, never toasted.

```tsx
<CopyButton value={inviteUrl} aria-label={t('action.copyLink')} showEmoji={useIconMode().isEmoji} />
<CopyButton value={apiKey} label={t('action.copy')} copiedLabel={t('action.copied')} layout="inline" />
<CopyButton value={code} label={t('action.copy')} onCopy={(ok) => { if (!ok) toast.error(t('copy.failed')) }} />
```

## `ColorPicker` — free vs constrained

A general, controlled colour picker behind a compact popover trigger. Two behaviours,
chosen by whether you constrain it:

- **Free** (default) — a full hue/saturation range (the `react-colorful` optional peer;
  install it when you use `ColorPicker`). `onChange` emits a CSS colour string in `format`
  (`hex` · `rgb` · `hsl`). The hex format also gets an editable hex field; rgb/hsl show the
  current value read-only below the canvas.
- **Constrained** — pass a `colors` set and the picker is **limited** to it, shown as a
  `Tab`-navigable swatch grid (the same a11y model as `SegmentedControl`). Each entry may
  be **any** CSS colour string; `onChange` emits the picked entry verbatim. `format` is
  ignored.

It is **controlled** and persists nothing: `value` / `onChange` is always a
**directly-usable CSS colour string** — drop it into a `style` / `background`. In free mode
pass / read `value` in the same `format`. `placeholder` is **required** — pass a translated
string via your i18n seam.

```tsx
// Free pick — hex (default):
const [color, setColor] = useState('#3b82f6')
<ColorPicker label="Any color" placeholder={t('color.pick')} value={color} onChange={setColor} />

// Free pick — rgb / hsl output:
<ColorPicker format="rgb" placeholder={t('color.pick')} value={rgb} onChange={setRgb} />
<ColorPicker format="hsl" placeholder={t('color.pick')} value={hsl} onChange={setHsl} />

// Constrained to a fixed set:
<ColorPicker colors={['#ef4444', '#22c55e', '#3b82f6']} placeholder={t('color.pick')} value={color} onChange={setColor} />
```

## `Collapsible` vs `Accordion`

Both are disclosure components on Radix. Pick by cardinality:

- **`Collapsible`** — a **single** disclosure: one trigger toggling one collapsible region
  (open-state management, `aria-expanded`/`aria-controls`, the
  `--radix-collapsible-content-height` var the height animation reads). Works **controlled**
  (`expanded` + `onExpandedChange`) or **uncontrolled** (`defaultExpanded`).
- **`Accordion`** — a **set** of disclosures with group behaviour: roving arrow-key focus
  between headers, and single (one-open-at-a-time) or `multiple`-open mode. **Data-driven**
  via `items`; the open set is **controlled** (`value` / `onValueChange`) or **uncontrolled**
  (`defaultValue`).

`AccordionItem`: `{ value: string; trigger: ReactNode; content: ReactNode; disabled?: boolean; actionsStart?: ReactNode; actionsEnd?: ReactNode }`.

Both expose `actionsStart` / `actionsEnd` slots whose clicks don't toggle the disclosure,
a rotating chevron (`showArrow`), and `variant` for structural style only (`Collapsible`:
`default`·`bordered`·`ghost`·`filled`; `Accordion`: `default`·`bordered`·`separated`).

```tsx
// Collapsible — uncontrolled, open by default:
<Collapsible defaultExpanded trigger="Shipping & returns">
  <p>Free shipping over 500 kr…</p>
</Collapsible>

// Collapsible — controlled, trigger reflects state:
const [open, setOpen] = useState(false)
<Collapsible variant="bordered" expanded={open} onExpandedChange={setOpen}
  renderTrigger={(o) => <span>{o ? 'Hide details' : 'Show details'}</span>}>
  <p>…</p>
</Collapsible>

// Accordion — single (default), opening one closes the rest:
const items = [
  { value: 'a', trigger: 'First', content: <p>…</p> },
  { value: 'b', trigger: 'Second', content: <p>…</p> },
]
<Accordion variant="bordered" defaultValue="a" items={items} />

// Accordion — multiple, independent:
<Accordion type="multiple" variant="separated" defaultValue={['a', 'b']} items={items} />
```

## `UserPreferences`

A fully **controlled** theme/display panel in a Radix dialog (palette + light/dark/system
+ an optional icons↔emojis switch). It **persists nothing** — reads each value, emits
`onChange` — so the consumer owns storage. Auth-free; surface sign-out/profile via the
`accountActions` slot.

The kit **never imports i18n or the icons module**: pass translated label text via props
(all labels have English defaults), and wire the icons↔emojis swap yourself via
`useIconMode().isEmoji`.

**Sectioned (two-pane) mode.** Pass a `sections` array and the panel grows into a wider
two-pane dialog: a left icon+label nav and a swappable right pane. **The nav is exactly the
sections you pass, in order** — there is no auto-inserted Theme item. The built-in
palette/mode/display controls are themselves a section: include an entry with
`id: 'theme'` (your own `icon`/`label`, `content` omitted) wherever you want it in the
order, and the shell injects the theme pane there; leave the entry out to render no theme
section at all. Every other `UserPreferencesSection` (`{ id, icon, label, content }`)
supplies its own `content`. Omit `sections` entirely and nothing changes — the
single-column panel renders exactly as before. The shell stays icon- and
language-neutral: pass already-resolved icon nodes and translated labels.

The selected section is **controlled-or-internal**, like `open`: pass
`activeSection` + `onActiveSectionChange` to own it — e.g. persist to `sessionStorage`
so the dialog reopens where the user left off — or omit both and the component remembers
the last-viewed section across close→reopen within its lifetime (seeded to the first nav
item). A stale or removed id falls back to the first item; the shell never resets to a
fixed section on open.

```tsx
// wire to useTheme() + useIconMode():
<UserPreferences theme={theme} themes={themes} onThemeChange={setTheme}
  mode={mode} onModeChange={setMode}
  followSystem={isSystemMode} onFollowSystemChange={setSystemMode}
  iconMode={iconMode} onIconModeChange={setIconMode} />

// …or as a sectioned dialog — you compose the whole order. Language leads here,
// the built-in Theme pane is second (id: 'theme', no content), Sound last:
<UserPreferences /* …theme/mode/icon props + labels… */
  sections={[
    { id: 'language', icon: <AppIcon name="language" />, label: t('prefs.language'),
      content: <LanguageSettings /> },
    { id: 'theme', icon: <AppIcon name="theme" />, label: t('prefs.appearance') },
    { id: 'sound', icon: <AppIcon name="sound" />, label: t('prefs.sound'),
      content: <SoundSettings /> },
  ]} />
```

## `EmojiPicker` / `EmojiBar`

- **`EmojiPicker`** — a full emoji picker panel (search, scrollable category tabs with a
  frequently-used tab, an 8-column grid). Ships no popover or trigger of its own; embed it
  inline or nest it inside a `<Popover>`. Requires the `emojibase-data` optional peer
  (`pnpm add emojibase-data`). `locale` `'en'`/`'nb'` are bundled; others fall back to
  `'en'`. `searchPlaceholder` / `noResultsLabel` accept translated strings.
- **`EmojiBar`** — a compact strip of quick-access emoji buttons; no search, no categories.
  `emojis` defaults to `EMOJI_FREQUENT` (👍 ❤️ 😂 😮 😢 😡 🎉 👏 🔥 💯 ✨ 🙏). No peer dependency.
- **`EmojiEmpty`** — a muted rounded-box placeholder (`+`) sized to one emoji slot. Use as
  the unset-value display wherever you show a selected emoji, so the empty state is never
  mistaken for a real selection. No peer dependency.

```tsx
// Inline picker — embed directly in a form or chat UI:
<EmojiPicker onSelect={(emoji) => setReaction(emoji)} />

// Behind a Popover trigger — EmojiEmpty as the unset placeholder:
const [open, setOpen] = useState(false)
<Popover open={open} onOpenChange={setOpen}
  trigger={
    <Button variant="outline">
      {reaction ? <span>{reaction}</span> : <EmojiEmpty />}
    </Button>
  }>
  <EmojiPicker onSelect={(emoji) => { setReaction(emoji); setOpen(false) }} />
</Popover>

// Norwegian locale:
<EmojiPicker locale="nb" onSelect={onSelect} />

// EmojiBar — default frequent set, custom set, subset:
<EmojiBar onSelect={(emoji) => appendToMessage(emoji)} />
<EmojiBar emojis={['🎉', '🔥', '💯', '✅']} onSelect={onSelect} />
<EmojiBar emojis={EMOJI_FREQUENT.slice(0, 6)} onSelect={onSelect} />
```

## See also

- [API reference → components](../specifications/api-reference.md) — the lean export + prop reference
- [card-grid.md](card-grid.md) — the cards (`StatCard`, `ContentCard`, `PaperCard`, `PhiCard`) and the two grids
- [theme.md](theme.md) — the token contract and the surface ladder
- [icons.md](icons.md) — the icons↔emojis seam the `showEmoji` props wire to
