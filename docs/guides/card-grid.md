# Card Grid Layout Guide

my-react-shell ships **two** card-grid layouts. They are not interchangeable — pick by
whether the cards you are placing have an intrinsic, fixed size.

| Layout | Cards | Behaviour |
| :--- | :--- | :--- |
| **`CardGrid`** (static) | Fixed-size (`StatCard`, `ContentCard`, `PhiCard`) | Cards flow left-to-right and **wrap**; a fixed gap between them; **no stretching** — a larger gap may remain at the end of a row. Every card keeps its own width/height. |
| **`DynamicCardGrid`** + **`DynamicGridCard`** (fluid) | Size-less | Cards **stretch** to fill uniform `1fr` columns; a built-in search / filter / sort toolbar. |

---

## 1. `CardGrid` — the static grid

For cards that already know their own size. The grid is a thin flex-wrap container: it lays
the cards out left-to-right with a fixed gap and wraps when a row is full. Cards are never
stretched, so the trailing space on a partial row simply stays empty.

```tsx
import { CardGrid, StatCard, ContentCard } from 'my-react-shell/components'

<CardGrid>
  <StatCard title="Active" medallion={{ value: 27, label: 'LIVE' }} stats={[{ value: 18, label: 'Open' }]} />
  <ContentCard title="Status" content="All systems operational" tone="success" />
  {/* … more fixed-size cards */}
</CardGrid>
```

- **`align`** — `'start'` (default) packs from the left; `'center'` centers each row.
- **`gap`** — any CSS length; default `1.5rem`. The default is sized so **four ≈312px cards
  fit a `wide` (1440px) page-container row** (`StatCard`/`ContentCard` default `md` = 312px).

### The fixed-size cards

`StatCard`, `ContentCard`, and `PhiCard` are **fixed-width golden-ratio** cards: a `size`
preset sets the pixel width and the height follows `height = width / φ`.

- `StatCard` and `ContentCard` are **self-contained** — they carry their own `size` scale
  and golden-ratio constant. Their `size` widths are `sm` 240 · `md` 312 · `lg` 400 · `xl` 520 px (default `md`).
- `PhiCard` keeps its own scale (`sm` 180 · `md` 240 · `lg` 320 · `xl` 480 px).

`StatCard` and `ContentCard` also have a **`shape`** proportion axis: `'standard'` (φ:1, default)
or `'landscape'` (φ²:1 — `height = width / φ²`, a shorter box at the same `size` width). Use
landscape for light cards (no footer, small content) where the standard height reads too tall;
a full stats row + footer can overflow the shorter box — the consumer's call when to use it.

---

## 2. `DynamicCardGrid` + `DynamicGridCard` — the fluid grid

For cards that have no intrinsic size and should stretch to fill the available width
uniformly, with no awkward gaps. This is a CSS-Grid layout with a search/filter/sort toolbar.

### How it stretches uniformly

The grid container uses
`grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--mrs-dynamic-card-grid-min)), 1fr))`.
Passing a `cardSize` to `DynamicCardGrid` emits two CSS variables down the tree:

- `--mrs-dynamic-card-grid-min` — the minimum column width.
- `--mrs-dynamic-card-grid-item-max` — the maximum width a card grows to.

`DynamicGridCard` takes `width: 100%` to fill its column and inherits the grid's cap via
`max-width: var(--mrs-dynamic-grid-card-max-width, var(--mrs-dynamic-card-grid-item-max, 100%))`,
centering itself (`margin: 0 auto`) when its lane is wider than the cap. `1fr` columns keep
every column uniform across all rows; the cap keeps a lone card on a sparse row from
stretching grotesquely.

```tsx
import { DynamicCardGrid, DynamicGridCard } from 'my-react-shell/components'

<DynamicCardGrid
  items={items}
  getKey={(it) => it.id}
  cardSize="md"
  renderCard={(it) => <DynamicGridCard title={it.title}>{it.body}</DynamicGridCard>}
/>
```

### Sizes (fluid)

`cardSize` on the grid drives the columns — **set the size on the grid, not on each card**:

| Size | Min column width | Max stretch | Best for |
| :--- | :--- | :--- | :--- |
| **`sm`** | 180px | 210px | Dense data, small metrics. |
| **`md`** | 240px | 320px | Standard widgets. |
| **`lg`** | 400px | 500px | Featured content, wide charts. |

`DynamicGridCard` also has a `shape`: `'standard'` (φ:1, default) or `'landscape'` (φ²:1,
shorter and wider).

> A `DynamicGridCard` used **outside** a `DynamicCardGrid` can set its own `size` to get the
> same min/max cap; inside a grid, omit it and let `cardSize` drive the columns.

### Navigation links (whole-card anchor)

`DynamicGridCard` can act as a **whole-card navigation target** without the shell depending on
any router. The consumer supplies its own router `<Link>` through the `renderLink` render-prop;
the card mounts it as a **full-bleed block-link overlay** inside a `position: relative` root, so
the entire tile is one real, keyboard-focusable, keyboard-activatable anchor — while the card
root `<div>` keeps owning its hover / border / `:focus-visible` states.

```tsx
import { Link } from '@tanstack/react-router'

renderCard={(it) => (
  <DynamicGridCard
    figure={it.icon}
    title={it.title}
    subtitle={it.subtitle}
    hoverable
    footer={{ lines: [{ text: it.meta }] }}
    corner={<DropdownMenu iconTrigger={…} items={…} />}
    renderLink={(p) => <Link {...p} to="/area/$id" params={{ id: it.id }} />}
  />
)}
```

- **Router-agnostic + type-safe.** The shell imports no router. Because the `<Link>` JSX is
  written literally at the call site, TanStack Router's `to`/`params` type-checking is fully
  preserved — write `renderLink` inline in each `renderCard`, not behind an indirection.
- **Accessible name is auto-wired.** The card gives its `title` a `useId` id and passes
  `aria-labelledby` to the overlay anchor, so the link is named from the title with zero
  consumer burden. Override by putting `aria-label` on the `<Link>` you pass to `renderLink`
  (only needed when there's no `title`).
- **Interactive controls go in raised slots, never the link.** A `<button>`/`<a>` can't nest
  inside an `<a>`. The `corner` slot (and, on `StatCard`, the medallion button and drag handle)
  is a **sibling** of the overlay, raised above it with `z-index`, so it stays independently
  clickable. The freeform `footer` is display-only text covered by the overlay — never put a
  live control there; add a raised slot for it instead.

The same `renderLink` + block-link-overlay seam is shared by `StatCard` and `ContentCard`, so a
card used for navigation behaves identically across the whole card surface.
