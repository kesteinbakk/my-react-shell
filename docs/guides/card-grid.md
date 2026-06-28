# Card & Card-Grid Guide

This is the **read-first** guide for every card in `my-react-shell/components` — the card
components themselves *and* the two grids that lay them out. All cards are imported from
`my-react-shell/components`.

## Which card component?

Pick the card by what it holds; pick the grid by whether the card has a fixed size.

| Card | Use it for | Sizing |
| :--- | :--- | :--- |
| **`StatCard`** | A KPI / status tile: title, accent medallion (number or arc-ring), a stats row, optional gauge. | Fixed-width, golden-ratio (`height = width / φ`). |
| **`ContentCard`** | A freeform-text tile: title + a `content` string (optional `html`), optional gauge. The text counterpart to `StatCard`. | Fixed-width, golden-ratio. |
| **`PaperCard`** | A small preview / thumbnail styled as a dog-eared A4 sheet. | Fixed-width, A4 portrait (`height = width × √2`). |
| **`DynamicGridCard`** | A size-less tile that should **stretch** to fill its grid column. The card to reach for inside a `DynamicCardGrid` (e.g. navigation tiles). | Fluid — fills its column, golden-ratio shape. |
| **`PhiCard`** *(legacy)* | The original golden-ratio card. **Being phased out** — prefer `StatCard` / `ContentCard` for new work; it ships only so existing consumers keep building. | Fixed-width, golden-ratio. |

> **Navigation — any card can be a real link.** `StatCard`, `ContentCard`, `PaperCard`, and
> `DynamicGridCard` all accept a **`renderLink`** render-prop that turns the whole tile into a
> consumer-supplied router `<Link>` (a block-link overlay), without the shell depending on any
> router. See [§3 Navigation links](#3-navigation-links-any-card) — this is the one pattern for
> all four, so a card used as a nav target behaves identically everywhere.

## Which grid?

my-react-shell ships **two** card-grid layouts. They are not interchangeable — pick by
whether the cards you are placing have an intrinsic, fixed size.

| Layout | Cards | Behaviour |
| :--- | :--- | :--- |
| **`CardGrid`** (static) | Fixed-size (`StatCard`, `ContentCard`, `PaperCard`, legacy `PhiCard`) | Cards flow left-to-right and **wrap**; a fixed gap between them; **no stretching** — a larger gap may remain at the end of a row. Every card keeps its own width/height. |
| **`DynamicCardGrid`** + **`DynamicGridCard`** (fluid) | Size-less | Cards **stretch** to fill uniform `1fr` columns; a built-in search / filter / sort toolbar. |

> **Match the card to the grid.** Fixed-size cards (`StatCard` / `ContentCard` / `PaperCard`)
> go in `CardGrid`; a size-less `DynamicGridCard` goes in `DynamicCardGrid`. Putting a
> fixed-size card in the fluid grid makes it overflow its narrower `1fr` column and overlap its
> neighbour — a real bug, not a cosmetic one.

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

`StatCard`, `ContentCard`, and the legacy `PhiCard` are **fixed-width golden-ratio** cards: a
`size` preset sets the pixel width and the height follows `height = width / φ`.

- `StatCard` and `ContentCard` are **self-contained** — they carry their own `size` scale
  and golden-ratio constant. Their `size` widths are `sm` 240 · `md` 312 · `lg` 400 · `xl` 520 px (default `md`).
- `PhiCard` *(legacy — being phased out; prefer `StatCard` / `ContentCard`)* keeps its own
  scale (`sm` 180 · `md` 240 · `lg` 320 · `xl` 480 px).

`StatCard` and `ContentCard` also have a **`shape`** proportion axis: `'standard'` (φ:1, default)
or `'landscape'` (φ²:1 — `height = width / φ²`, a shorter box at the same `size` width). Use
landscape for light cards (no footer, small content) where the standard height reads too tall;
a full stats row + footer can overflow the shorter box — the consumer's call when to use it.

`PaperCard` is the odd one out: a fixed-size card that is **portrait, not golden-ratio** — a
small preview/thumbnail styled as a dog-eared sheet of paper at **A4 proportions**
(`height = width × √2`, so it's *taller* than wide). Its own `size` scale is `sm` 168 · `md`
210 · `lg` 264 · `xl` 320 px (default `sm`; `md` is literally A4's mm figures). It drops into
`CardGrid` like the others — just expect a taller row. It shares the card-family
`footer` slot, hover-lift, drag-handle, and `renderLink` navigation seam ([§3](#3-navigation-links-any-card));
an accent stripe is opt-in (none by default).

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

---

## 3. Navigation links (any card)

`StatCard`, `ContentCard`, `PaperCard`, and `DynamicGridCard` can each act as a **whole-card
navigation target** without the shell depending on any router. The consumer supplies its own
router `<Link>` through the `renderLink` render-prop; the card mounts it as a **full-bleed
block-link overlay** inside a `position: relative` root, so the entire tile is one real,
keyboard-focusable, keyboard-activatable anchor — while the card root `<div>` keeps owning its
hover / border / `:focus-visible` states. It is **one pattern across all four cards**, so a card
used for navigation behaves identically wherever you use it.

The example below uses `DynamicGridCard` inside a `DynamicCardGrid`; the same `renderLink` prop
goes on a `StatCard` / `ContentCard` / `PaperCard` rendered through `CardGrid` + `.map()`.

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
- **`dragHandle` × `renderLink` are mutually exclusive** — a nav tile is not drag-reorderable;
  passing both throws in dev.

On the fixed-size cards the overlay sits *beneath* the content layer and the inner wrapper is
click-transparent, so `StatCard`'s medallion button (`onMedallionPress`) and any drag handle
stay live above it. Type-safety, the auto-wired accessible name, and the raised-slot rule are
identical to the example above on all four cards.
