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

Shipped today: **`Alert`**. The kit grows per T004 (ConfirmDialog, Toast, InfoBox,
EmptyState, Spinner, Card, Badge, Chip, Avatar, Table, InputField, Select,
SegmentedControl).

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
