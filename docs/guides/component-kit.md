# components module

The **opinionated component kit** — React composites that bake a design / layout /
behavior decision on top of shadcn/Radix primitives and render against the semantic
theme tokens (light + dark, every palette). Shipped at the sub-path
**`my-react-shell/components`**.

```ts
import { Alert, cn } from 'my-react-shell/components'
import type { AlertProps, AlertVariant } from 'my-react-shell/components'
import 'my-react-shell/components/styles.css'
```

## What it ships — and what it doesn't

The kit ships **only components that need an opinion** — a structure, layout, or
behavior decision on top of the primitive. Un-opinionated shadcn primitives (Button,
Input, Checkbox, Label, Switch, Separator, plain Tabs / Dialog / Select, Tooltip,
Popover) are **not** shipped: use shadcn directly for those. The demo's
`ComponentSections` shows the plain shadcn primitives; the demo's **Kit** page shows
this module.

Shipped today: **`Alert`**, **`InfoBox`**, **`EmptyState`**, **`Spinner`** (+
`PageSpinner` / `SectionSpinner`), **`ConfirmDialog`**, the **`Toast`** system
(`ToastProvider` + `useToast`), **`Badge`**, **`Chip`** / **`ChipGroup`**, **`Avatar`** /
**`AvatarGroup`**, **`Table`**, **`ActionButton`** / **`ActionButtonGroup`**, **`InputField`**,
**`SegmentedControl`**, **`Select`**, and **`UserPreferences`** (a theme / display settings
panel). (`Card` is intentionally *not* shipped — shadcn's Card works out of the box; the
kit ships only opinionated composites. The plain shadcn **`Button`** primitive isn't shipped
either — `ActionButton` is the *opinionated* icon/emoji-with-label action button, not a
replacement for it.)

## Wire it

Two imports — the components and the stylesheet:

```tsx
import { Alert } from 'my-react-shell/components'
import 'my-react-shell/components/styles.css'

function Example() {
  return (
    <Alert variant="warning" title="Heads up" onDismiss={() => {}}>
      Your session expires in 5 minutes.
    </Alert>
  )
}
```

The stylesheet is required: like every shipped module, the kit ships **its own CSS**
(`mrs-`-prefixed classes on the theme tokens) rather than Tailwind utilities — a
consumer's Tailwind never scans `node_modules`, so utilities wouldn't survive the
build. Importing it once is the only wiring step; styling tracks the active palette and
mode automatically through the tokens. No Tailwind config, no `@source` line.

## `Alert`

An inline alert / callout: a tinted surface (`--color-<tone>-bg`), a matching border
(`--color-<tone>-border`), and AA-legible on-tint text (`--color-<tone>-strong`), with
a per-tone leading icon and an optional dismiss control.

| Prop | Default | Meaning |
|------|---------|---------|
| `variant` | `'info'` | `info` · `success` · `warning` · `danger`. |
| `title` | — | Optional bold lead line. |
| `children` | — | The alert body / description. |
| `icon` | per-variant | Override the leading icon, or pass `false` to drop it. |
| `onDismiss` | — | When set, renders a dismiss button calling this. |
| `dismissLabel` | `'Dismiss'` | Accessible label for the dismiss button. |
| `role` | `'alert'` | `alert` (assertive) or `status` (non-urgent). |
| `className` | — | Extra classes, merged via `cn()`. |

## Other feedback components

- **`Spinner`** / **`PageSpinner`** / **`SectionSpinner`** — a rotating indicator on the
  current text color; the block variants center it for a page or section loading state.
- **`InfoBox`** — a neutral, tone-free contextual note (icon + title + body). Reach for
  `Alert` when the message carries a semantic tone.
- **`EmptyState`** — centered zero-state: optional icon, required title, description, and
  an action slot.
- **`ConfirmDialog`** — a controlled confirmation dialog on Radix Dialog (overlay, focus
  trap, Esc / backdrop close). `variant="danger"` makes the confirm destructive; it
  renders its own confirm / cancel buttons.

  ```tsx
  const [open, setOpen] = useState(false)
  <ConfirmDialog
    open={open}
    onOpenChange={setOpen}
    title="Delete this item?"
    description="This cannot be undone."
    variant="danger"
    confirmLabel="Delete"
    onConfirm={() => { setOpen(false); /* … */ }}
  />
  ```

- **`Toast`** — mount `<ToastProvider>` once near the app root, then fire toasts
  imperatively from any descendant via `useToast()`. Each toast renders as an `Alert` and
  auto-dismisses (default 5s; `duration: 0` keeps it until dismissed).

  ```tsx
  // near the root
  <ToastProvider><App /></ToastProvider>

  // anywhere inside
  const toast = useToast()
  toast.success('Saved', { title: 'Success' })
  toast.error('Something went wrong')
  ```

## Data display

- **`Badge`** — compact status / category badge with semantic tones (`neutral` ·
  `success` · `warning` · `danger` · `info`) and an optional status `dot`.
- **`Chip`** / **`ChipGroup`** — a tag that's plain, toggleable (`onClick` + `selected`),
  or removable (`onRemove`); `ChipGroup` is the wrapping flex layout.
- **`Avatar`** / **`AvatarGroup`** — image with an initials fallback (also on image error);
  `AvatarGroup` stacks avatars with an optional `+N` overflow badge.
- **`Table`** — a column-config data table with optional per-column sorting, zebra
  striping, a sticky header, and an empty state.

  ```tsx
  const columns: TableColumn<Row>[] = [
    { key: 'name', header: 'Name', render: (r) => r.name, sortValue: (r) => r.name },
    { key: 'n', header: 'Count', align: 'right', render: (r) => r.n, sortValue: (r) => r.n },
  ]
  <Table columns={columns} data={rows} rowKey={(r) => r.id} />
  ```

## Actions

- **`ActionButton`** — an opinionated icon/emoji + label action button on the semantic
  tokens. It ships **presets** for the common actions, each carrying the *correct* glyph
  (a hand-rolled SVG **and** an emoji), a semantic colour, and a default English label —
  so the everyday CRUD/toolbar actions are one prop:

  ```tsx
  import { ActionButton, ActionButtonGroup } from 'my-react-shell/components'

  <ActionButtonGroup>
    <ActionButton action="add" showLabel onClick={onAdd} />
    <ActionButton action="edit" hint="Edit" onClick={onEdit} />
    <ActionButton action="delete" onClick={onDelete} />
    <ActionButton action="star" active={isFavorite} onClick={toggleFavorite} />
  </ActionButtonGroup>
  ```

  Presets: `add` · `edit` · `delete` · `copy` · `share` · `download` · `upload` · `save` ·
  `search` · `refresh` · `settings` · `star` · `close` · `more`. The map is exported as
  `actionPresets` (`{ variant, emoji, label }` per action) if you need its values.

  For anything without a preset, bring your own glyph — pass a custom `icon` node (a lucide
  icon, or an `<Icon>` from `my-react-shell/icons`):

  ```tsx
  import { Upload } from 'lucide-react'
  <ActionButton icon={<Upload size={20} />} label="Import" variant="info" onClick={onImport} />
  ```

  Like the rest of the kit it **never imports i18n or the icons module**: pass translated
  text through `label` (the preset label is the English default + the accessible name), and
  wire the icons↔emojis seam yourself via `showEmoji` — each preset renders its emoji
  instead of its SVG when it's set:

  ```tsx
  import { useIconMode } from 'my-react-shell/icons'
  const { isEmoji } = useIconMode()
  <ActionButton action="delete" showEmoji={isEmoji} onClick={onDelete} />
  ```

  | Prop | Default | Meaning |
  |------|---------|---------|
  | `action` | — | A preset (`add` · `delete` · `star` · …) supplying the glyph, emoji, colour, and default label. Either `action` or `icon` is required. |
  | `icon` | per-preset | A custom glyph node. Required when there's no `action`; overrides the preset glyph otherwise. |
  | `emoji` | per-preset | Override the preset emoji (shown when `showEmoji`). |
  | `label` | — | Visible label text; overrides the preset label. |
  | `showLabel` | `false` | Show the preset's default label without retyping it (ignored when `label` is set). |
  | `showEmoji` | `false` | Render the emoji instead of the SVG icon — wire to `useIconMode().isEmoji`. |
  | `variant` | preset / `neutral` | `neutral` · `primary` · `secondary` · `success` · `warning` · `danger` · `info`. |
  | `size` | `sm` | `xs` · `sm` · `md` · `lg` · `xl` — drives padding, glyph, and label size. |
  | `layout` | `vertical` | `vertical` (glyph over label) or `inline` (glyph left of label). |
  | `active` | — | For `action="star"`: filled + `aria-pressed` when true. |
  | `coloredLabel` | `false` | Let the label take the variant colour instead of staying neutral. |
  | `hint` | — | Native tooltip (the `title` attribute). |
  | `disabled` / `type` / `onClick` / `aria-label` / `className` | — | The usual button props; `aria-label` falls back to the visible label, then `hint`, then the preset label. |

- **`ActionButtonGroup`** — a flex container for a set of action buttons (a toolbar row, or
  a column with `vertical`).

## `UserPreferences`

A drop-in user-options panel — **theme palette + light/dark/system + an optional
icons↔emojis switch** — in a Radix dialog opened from an icon button. The React-era
take on foundation's `ThemeAction` modal. Drop it into the app-shell action slot (or
any header).

It is **fully controlled**: it reads each current value and emits an `onChange`, and
**persists nothing itself** — so you decide where preferences live (localStorage via
the shipped providers, or a per-user account / Convex). It's also **auth-free**:
surface sign-out / profile through the `accountActions` slot. Labels come via props
(English defaults), so the kit never imports i18n.

```tsx
import { useTheme } from 'my-react-shell'
import { useIconMode } from 'my-react-shell/icons'
import { UserPreferences } from 'my-react-shell/components'

function PreferencesButton() {
  const { theme, themes, setTheme, mode, setMode, isSystemMode, setSystemMode } = useTheme()
  const { iconMode, setIconMode } = useIconMode()
  return (
    <UserPreferences
      theme={theme} themes={themes} onThemeChange={setTheme}
      mode={mode} onModeChange={setMode}
      followSystem={isSystemMode} onFollowSystemChange={setSystemMode}
      iconMode={iconMode} onIconModeChange={setIconMode}
    />
  )
}
```

| Prop | Default | Meaning |
|------|---------|---------|
| `theme` / `themes` / `onThemeChange` | — | Active palette, the list to offer (`useTheme().themes`), and the change handler. **Required.** |
| `mode` / `onModeChange` | — | Active color mode and its handler. **Required.** |
| `followSystem` / `onFollowSystemChange` | — | Pass both to show a **System** option that follows the OS. |
| `iconMode` / `onIconModeChange` | — | Pass both to show the **icons↔emojis** switch (from `my-react-shell/icons`). |
| `accountActions` | — | Rows below a divider — e.g. a sign-out button. Keeps the kit auth-free. |
| `trigger` | icon button | Override the dialog trigger. |
| `open` / `onOpenChange` | self-managed | Control the open state if you need to. |
| label props | English | `triggerLabel`, `title`, `description`, `themeHeading`, `modeHeading`, `displayHeading`, `lightLabel`, `darkLabel`, `systemLabel`, `iconsLabel`, `emojisLabel`, `closeLabel` — pass translated values via your `t()`. |
| `className` | — | Extra classes on the dialog, merged via `cn()`. |

The icons↔emojis switch only *does* something if the rest of your UI renders through
the `my-react-shell/icons` seam — see the [icons guide](icons.md).

## Forms

The kit ships only the *opinionated* form pieces — for plain inputs / checkboxes /
switches, use shadcn directly.

- **`InputField`** — a complete field: label + input + helper/description + error,
  wired for accessibility (`htmlFor`, `aria-invalid`, `aria-describedby`). Spreads
  native input props, so `type` / `value` / `onChange` / `placeholder` pass through;
  pass `error` to switch on the error styling.
- **`SegmentedControl`** — single-select segmented control (a `radiogroup` of options
  on a track, the active one lifted onto a surface chip). Controlled via `value` /
  `onChange`; generic over the option value type.
- **`Select`** — an opinionated select on **Radix Select** (keyboard nav, typeahead,
  portal, collision handling). Pass an `options` list; controlled via `value` /
  `onValueChange`. `@radix-ui/react-select` is an optional peer behind this sub-path.

  ```tsx
  <Select
    value={value}
    onValueChange={setValue}
    placeholder="Pick one…"
    options={[
      { value: 'a', label: 'Apple' },
      { value: 'b', label: 'Banana', disabled: true },
    ]}
  />
  ```

## How it's built

- **shadcn-based, self-contained.** Components are built on Radix headless primitives
  (optional peers, shared with the app-shell module) + `class-variance-authority`
  variants + the `cn()` (`clsx` + `tailwind-merge`) helper exported from the module.
  The kit never imports the consumer's `@/components/ui`.
- **Themed only through tokens.** No hardcoded colors; every component renders in every
  palette, light + dark, via the semantic contract (`styles/base.css`).
- **Optional peers, behind the sub-path:** `class-variance-authority`, `clsx`,
  `tailwind-merge` — tiny, and already present in any shadcn consumer. A theme-only
  consumer (importing just the barrel) installs none of them.

## Theming

Components consume the same tokens as everything else, including the neutral
`secondary` and the `-strong` semantic text tokens (the legible-on-tint text used by
`Alert`). Change a token in your palette and the kit follows — no component edits.
