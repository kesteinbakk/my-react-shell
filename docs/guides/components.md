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

## Built-in chrome copy vs. consumer content

i18n is a **core** module, so components ship translated defaults for their own *chrome*.
Split every string a component emits into two kinds — and never write a bare literal for
either.

- **Chrome** — the shell's own generic UI vocabulary: Close, Cancel, OK, Dismiss, Remove,
  a search placeholder, loading / no-results states, a generic `aria-label` like "Actions"
  / "Select language". Chrome resolves through the internal **`useShellText()`** hook
  against the shell's shipped **`mrs.*`** catalog — a *soft* i18n read that falls back to
  the bundled default-locale (English) catalog. So it renders even with no
  `<I18nProvider>` and **localizes** when one is mounted with the shell catalog merged
  (`AppProviders({ i18n })` / `createProjectI18n` / `withShellCatalog`). Every such label
  is an **optional prop that defaults to its `mrs.*` key** — `closeLabel ??
  st('mrs.action.close')` — the prop still overrides. This is why `closeLabel`,
  `dismissLabel`, `confirmLabel`/`cancelLabel`, `removeLabel`, `iconTriggerLabel`,
  `EmojiPicker` search / no-results / category labels, `Spinner` label, `ToastProvider`
  `dismissLabel`, and `DynamicCardGrid`'s chrome are all **optional now**.

- **Content** — anything app-specific the shell can't know: titles, subtitles, data
  labels, entity/domain copy. This stays a **mandatory consumer prop** (no default);
  the consumer passes a translated string via its i18n seam. Examples: `Dialog`/`Sheet`
  `title`, the cards' `title`/`subtitle`, `Select`/`DatePicker` `placeholder` (what to
  pick is app-specific), every `UserPreferences` *heading* (`themeHeading`, `lightLabel`,
  …). A supplementary `aria-label` on an icon control whose meaning the icon already
  carries (`dragHandleLabel`, `PhiCard` `menuLabel`) stays an optional, no-default prop —
  pass it anyway for accessibility.

**Adding a new chrome string:** add its `mrs.*` key to **every** shipped
`src/i18n/locales/common-<locale>.json` (en-US + nb-NO today), then default the prop to it
via `useShellText()`. **Never** write a bare string literal (`'Close'`, `'Lukk'`) in a
component, in any language, even temporarily — chrome goes through `mrs.*`, content goes
through a mandatory prop. This **reverses T032** for chrome only; content still follows it.

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
Instead, the shell shows the red border the moment the user **leaves an empty required field**:
the **`validateOnBlur`** behaviour is **on by default whenever `required` is set**, so `required`
alone gives you asterisk + `aria-required` + red-border-on-blur with no extra wiring. It mirrors
the CSS `:user-invalid` timing — the border turns red only *after* a blur on an empty field, and
clears the instant a value is typed — but is implemented in the shell (no native constraint, no
bubble). It is **OR-ed** with the controlled `invalid`/`error`, which always wins, so it never
fights a form library that owns the error state.

Pass **`validateOnBlur={false}`** to opt out and keep the asterisk only — e.g. when a form
library owns the error state entirely and you don't want the shell's blur border on top.

```tsx
// Mandatory field — `required` alone: asterisk + aria-required + red border on blur-empty:
<Input label={t('field.email')} required fullWidth />
<Textarea label={t('field.bio')} required fullWidth />
<Select label={t('field.role')} required placeholder={t('field.pickRole')}
  options={roleOptions} value={role} onValueChange={setRole} />

// Opt out of the blur border — marker only, you own the error state (e.g. on submit):
<Input label={t('field.email')} required validateOnBlur={false} invalid={submitted && !email} fullWidth />
```

`InputField`'s blur border shows no message text (the shell can't hardcode language); pass `error`
for a translated message. Toggles (`Checkbox`/`Switch`) accept native `required` for form wiring
but render no asterisk — a marker on a single toggle reads oddly.

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

## Nested layers don't tear down their host dialog

`Dialog`, `Sheet`, and `ConfirmDialog` guard against a **nested layer collapsing the whole
surface** — so you can freely open a `Select`, `DropdownMenu`, or `Popover` inside a dialog,
or **stack a second `Dialog` on top of the first**, and interacting with (or dismissing) the
nested thing affects only *it*.

Radix quirks make this necessary, all handled for you:

- **Nested popper.** While a `Select`/menu/`Popover` is open, Radix locks the host content to
  `pointer-events: none`; a click inside the host but outside the popper would otherwise be
  re-read as an outside interaction and dismiss the host. Guarded by judging the gesture at
  its *pointerdown* start.
- **Stacked `Dialog` (including React siblings).** A second dialog opened on top — even one
  rendered as a React *sibling* rather than nested in the first's JSX, which Radix's own branch
  mechanism does not link — lives outside the first dialog's React tree. So interacting with it
  (clicking its ✕, focusing its fields) fires the *outer* dialog's outside-interaction handlers
  and used to dismiss it. The guard recognises that the interaction's target sits inside another
  `[role="dialog"]` and suppresses it (plus the trailing focus-to-`<body>` after the inner
  unmounts). A genuine backdrop dismissal targets the overlay — outside any dialog content — so
  the inner dialog's own backdrop/Esc/✕ and the outer's genuine backdrop click all still work.

You get this automatically; there is nothing to wire. (A `closeOnBackdrop={false}` dialog is
still the right call when you additionally want to protect in-progress edits from a genuine
backdrop click.)

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

It follows the kit's **chrome-vs-content** rule (above): the `label` is optional (icon-only when
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

A fully **controlled** settings panel in a Radix dialog with two built-in control groups:
a **theme** group (palette + light/dark/system) and a **display** group (an optional
icons↔emojis switch + an optional **menu-size** control that sizes the app-shell header
chrome — `medium`·`large`·`xlarge`). It **persists nothing** — reads each value, emits
`onChange` — so the consumer owns storage. Auth-free; surface sign-out/profile via the
`accountActions` slot.

The kit **never imports i18n or the icons/app-shell modules' state**: pass translated label
text via props (the theme/mode/icons labels are required; the menu-size labels default to
the shell's `mrs.*` chrome catalog), and wire the controls yourself — icons↔emojis via
`useIconMode()`, the menu size via `useMenuSize()` (`my-react-shell/app-shell`).

**Sectioned (two-pane) mode.** Pass a `sections` array and the panel grows into a wider
two-pane dialog: a left icon+label nav and a swappable right pane. **The nav is exactly the
sections you pass, in order** — there are no auto-inserted items. The built-in controls are
two reserved sections: include an entry with `id: 'theme'` (palette + light/dark/system)
and/or `id: 'display'` (icons↔emojis + menu size) — your own `icon`/`label`, `content`
omitted — wherever you want them in the order, and the shell injects each pane there; leave
an entry out to render no such section. Every other `UserPreferencesSection`
(`{ id, icon, label, content }`) supplies its own `content`. Omit `sections` entirely and
the single-column panel renders both the theme and display groups stacked. The shell stays
icon- and language-neutral: pass already-resolved icon nodes and translated labels.

The selected section is **controlled-or-internal**, like `open`: pass
`activeSection` + `onActiveSectionChange` to own it — e.g. persist to `sessionStorage`
so the dialog reopens where the user left off — or omit both and the component remembers
the last-viewed section across close→reopen within its lifetime (seeded to the first nav
item). A stale or removed id falls back to the first item; the shell never resets to a
fixed section on open.

```tsx
// wire to useTheme() + useIconMode() + useMenuSize():
<UserPreferences theme={theme} themes={themes} onThemeChange={setTheme}
  mode={mode} onModeChange={setMode}
  followSystem={isSystemMode} onFollowSystemChange={setSystemMode}
  iconMode={iconMode} onIconModeChange={setIconMode}
  menuSize={menuSize} onMenuSizeChange={setMenuSize} />

// …or as a sectioned dialog — you compose the whole order. Language leads here,
// then the built-in Theme (id: 'theme') and Display (id: 'display') panes, Sound last:
<UserPreferences /* …theme/mode/icon/menu-size props + labels… */
  sections={[
    { id: 'language', icon: <AppIcon name="language" />, label: t('prefs.language'),
      content: <LanguageSettings /> },
    { id: 'theme', icon: <AppIcon name="theme" />, label: t('prefs.appearance') },
    { id: 'display', icon: <AppIcon name="display" />, label: t('prefs.display') },
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
