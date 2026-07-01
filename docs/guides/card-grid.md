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
  <StatCard title="Active" stats={[{ value: 27, label: 'LIVE' }, { value: 18, label: 'Open' }]} />
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
(`height = width × √2`, so it's *taller* than wide). Its own `size` scale is `sm` 134 · `md`
168 · `lg` 210 · `xl` 264 · `xxl` 320 px (default `md`; `lg` is literally A4's mm figures). It drops into
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
shorter and wider). An **accent stripe** is opt-in via `tone` (semantic tokens) or a raw
`color`, with `accentPlacement` reading as a `'top'` stripe (default) or a `'left'` bar —
the same accent vocabulary as `StatCard`/`PaperCard`. It's independent of the faint surface
`tint`, so a card can carry both.

> A `DynamicGridCard` used **outside** a `DynamicCardGrid` can set its own `size` to get the
> same min/max cap; inside a grid, omit it and let `cardSize` drive the columns.

The header `icon` auto-shrinks, and a string `title` auto-fits (3 length-based steps, clamped
to 2 lines), on an `sm`-size card — `md`/`lg` keep both at their normal size. Resolution is
**deterministic, not measured**: `DynamicGridCard` reads its own `size` prop, falling back to
the enclosing `DynamicCardGrid`'s `cardSize` via context — so it works with no prop needed in
the common case (`size` omitted, `cardSize="sm"` on the grid). A `@container` query on the
card's rendered width was tried first and dropped: Chromium gives inconsistent results for a
container-query container that also carries `aspect-ratio` inside a `1fr` grid track, so two
equal-width cards could resolve to different icon/title sizes.

### Icon placement (all four cards)

`StatCard`, `ContentCard`, `PaperCard`, and `DynamicGridCard` all take the **same** `icon` prop
and placement vocabulary — the shared `CardIconPlacement` type + `{ content, placement }` config
(`CardIconConfig`). `icon` takes a bare `ReactNode` (shorthand for
`{ content: icon, placement: 'title' }` — the in-flow behavior, beside the title block) **or** the
full `{ content, placement }` form:

| `placement` | Behaviour |
| :--- | :--- |
| `'title'` *(default)* | In the document flow, beside the title block — pushes/sizes with the heading. |
| `'upperLeft'` · `'upperRight'` · `'lowerLeft'` · `'lowerRight'` | An absolutely positioned corner overlay — **never** affects layout (never pushes title/body/footer). |
| `'center'` | Replaces the card's main content area. |

```tsx
// In-flow (shorthand — identical to { content: '⚙️', placement: 'title' }):
<DynamicGridCard icon="⚙️" title="Setup" />

// Corner badge — doesn't push the title:
<StatCard title="Synced" icon={{ content: '✅', placement: 'lowerRight' }} />

// Replaces the body:
<ContentCard title="Empty state" icon={{ content: '📭', placement: 'center' }} />
```

**Per-card collision rules** — a placement that would land on an existing raised slot **throws
in dev** (a no-op in prod). The four corners and the drag handle don't collide: the handle is
vertically centred on the right edge, while the corner placements sit at the true top/bottom
edges.

| Card | `'upperRight'` collides with… | `'center'` collides with… |
| :--- | :--- | :--- |
| **`StatCard`** | the corner `medallion` (both own the top-right) | `stats` (both own the body) |
| **`ContentCard`** | — *(no corner-occupying slot)* | `content` / `children` (both own the body — with a `center` icon they're optional) |
| **`PaperCard`** | the `corner` slot (the icon is offset below the dog-eared fold to clear it, but `corner` sits there too) | `content` / `image` (both own the body) |
| **`DynamicGridCard`** | the `corner` slot | `children` |

### Hover feedback

A `hoverable` card's default hover state is a subtle background tint
(`--color-surface-raised`) — no movement, no shadow change. Pass **`lift`** to add a
`translateY` + stronger shadow on top of the tint for a more pronounced affordance (e.g. a
card that's the primary action in a dense layout). `hoverable` defaults to `true` when
`onClick` is set, so a clickable card gets the tint with no extra prop.

### Drag-reorder handle

`DynamicGridCard` carries the same `showDragHandle` / `dragHandle` / `dragHandleProps` /
`dragHandleLabel` seam as `StatCard` / `ContentCard` / `PaperCard`. Pass **`showDragHandle`**
(boolean) to render the built-in grip, or pass a custom handle `ReactNode` to **`dragHandle`**
(which implies a visible handle on its own). Spread your DND library's listeners (e.g. `@dnd-kit`'s
`attributes` + `listeners`) onto it through `dragHandleProps`. `dragHandleLabel` is the handle's
accessible name — **no default**; pass a translated string when a handle is shown (or supply
`aria-label` via `dragHandleProps`). If you omit it the grip glyph stands alone with no accessible
name, so pass it for any real reorder UI. Unlike the other cards (PaperCard/PhiCard) — whose handle sits
top-centre — the `StatCard`, `ContentCard`, and `DynamicGridCard` grip is **vertical stripes pinned to the right edge, vertically
centred**, and the card reserves a little right padding so the grip never overlaps its content.

Alternatively, you can make the **whole card surface** draggable by passing the opt-in
**`dragWholeCard`** prop, which spreads the `dragHandleProps` directly onto the root card container.
Its cursor is **conditional on whether the card is also clickable**: a drag-only card shows an open
hand (`grab`) at idle, while a clickable card (`onClick` / `hoverable`) keeps the normal `pointer`.
In **both** cases a short press-and-hold engages the closed hand (`grabbing`) — so a quick click
never changes the cursor (a 200ms hold threshold gates it). It can coexist with a focusable
`showDragHandle` grip for keyboard/screen-reader sorting.

Both drag mechanisms can safely **coexist with navigation links** (`renderLink` or `onClick`). Since DND library sensors (like `@dnd-kit`'s Mouse/Touch sensors) enforce distance activation thresholds (e.g. dragging at least 5px to start a drag), a quick click/tap on the card triggers normal navigation, while dragging past the threshold initiates a drag.

```tsx
import { DynamicGridCard } from 'my-react-shell/components'
import { useSortable } from '@dnd-kit/sortable'

function SortableCard({ item }: { item: Item }) {
  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id: item.id })
  return (
    <DynamicGridCard
      ref={setNodeRef}
      title={item.title}
      footer={{ lines: [{ text: item.meta }] }}
      showDragHandle
      dragHandleLabel={t('common.dragToReorder')}
      dragHandleProps={{ ...attributes, ...listeners }}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    />
  )
}
```

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
    icon={it.icon}
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
- **Dragging coexists with navigation.** You can combine a drag handle (`showDragHandle`) or `dragWholeCard` with `renderLink` or `onClick`. The browser distinguishes between dragging and clicking based on motion/delay thresholds set on your DND sensors.

On every card the overlay sits *beneath* the content layer and the content (`header`/`body`/
`footer` on `DynamicGridCard`, the equivalent inner wrapper on `StatCard`/`ContentCard`/
`PaperCard`) is click-transparent (`pointer-events: none`), so a click anywhere on the card —
not just the title — reaches the overlay; raised slots (`corner`, `StatCard`'s medallion button,
any drag handle) opt back into `pointer-events` to stay independently clickable. This matters
for `DynamicGridCard` specifically with a `watermark`: a watermarked card promotes `header`/
`body`/`footer` to `position: relative; z-index: 1` (to sit above the watermark's `z-index: 0`
layer), which ties the overlay's own `z-index: 1` — without click-transparency, the
later-in-DOM content would win that tie and silently swallow every click. Type-safety, the
auto-wired accessible name, and the raised-slot rule are identical across all four cards.

---

## 4. Watermarks — emoji or a hover-reveal mark

Every card in the family (`StatCard`, `ContentCard`, `PaperCard`, `DynamicGridCard`) shares one
`watermark` seam: it takes a **string** (a faint oversized emoji, the long-standing behaviour)
**or** a **`ReactNode`** art layer. The shipped art mark is **`DrawerMark`** — an isometric drawer
that rests closed and slides open on card hover, built on the **`RevealMark`** seam. An element
watermark makes the card root a `mrs-reveal-host`, which is what drives the open-on-hover; pass
`open` to keep it open for the active route.

**`autoscaleWatermark` (default `true`, all four cards)** — for a **`ReactNode`** watermark only,
it scales the node's intrinsic `<svg>`/`<span>` up to watermark scale (oversized and faint),
mirroring the string-emoji watermark — the right behavior for a small icon-kit glyph (e.g.
`<AppIcon>`). Pass **`autoscaleWatermark={false}`** for a self-sized illustration (e.g. `DrawerMark`)
that already lays itself out at watermark scale and shouldn't be force-scaled. It's a no-op for a
string watermark (and for `StatCard`/`ContentCard`'s `variant` ⚠️, which is a string).

```tsx
import { DynamicGridCard, DrawerMark } from 'my-react-shell/components'

<DynamicGridCard title="Files" subtitle="Project documents"
  footer={{ lines: [{ text: '8 items' }] }} hoverable
  watermark={<DrawerMark open={isActive} />}
  renderLink={(p) => <Link {...p} to="/files/$id" params={{ id }} />} />
```

`RevealMark` is the general seam — `<RevealMark closed={…} revealed={…} open?={…} />` cross-fades
its two layers on hover of the nearest `.mrs-reveal-host` (or when `open`). Build new openable
marks on it; the drawer is just the first instance. Both marks are decorative (`aria-hidden`) —
the card's `title` carries the accessible name.

---

## 4. Per-card behaviour & examples

The full prop tables live in the
[API reference](../specifications/api-reference.md).
This section carries the behaviour and the worked examples.

### `StatCard`

A self-contained φ-framed KPI / status card (`height = width / φ`). Internal layout: a
title + subtitle header, a corner accent **medallion**, a data-stats row, and an optional
footer slot.

- **Medallion** — `{ value, max, size? }`. Arc-ring only — `value` and `max` are both
  **required** (no plain-circle mode). `size` defaults to `'lg'`; `'sm'` renders a smaller
  footprint. Set `onMedallionPress` to make it a pressable `<button>`.
- **Accent** — the stripe + medallion tint are driven by `tone` (semantic tokens) or a raw
  `color` CSS string; `accentPlacement` reads as a `'top'` stripe or a `'left'` bar.
- **Side completion gauge** — `sideBarCompleteness` is a `0`–`1` fraction (clamped). The
  fill rises from the bottom to `value × height`, interpolating **red → amber → green**
  (`danger → warning → success`) over a faint track. It is independent of `accentPlacement`,
  so a top stripe and a side gauge can show at once. **Checked, not defaulted:** `undefined`
  → no gauge; `0` → an empty gauge. Combining with `accentPlacement='left'` throws in dev;
  in prod the gauge wins and the left stripe is suppressed.
- **`topStripeFollowsGauge`** — when `true`, the **whole accent** (top stripe + medallion
  tint + stat numbers) takes the gauge's completeness colour instead of `tone`/`color`, so
  the card reads as one coherent colour, and the stripe is forced to the top edge. Bound to
  `sideBarCompleteness`: with no gauge present there is **no top stripe** (medallion + stats
  fall back to `tone`/`color`).
- **`variant`** (`'warning'`·`'danger'`) — a structural alert variant. Overrides `tone` to
  the same value and forces `⚠️` as the watermark, ignoring `watermark`.
- **`stats`** — `{ value, label?, max? }[]`. `label` → label above + number below; `max` →
  compact arc-ring. **Cannot combine `label` and `max` on the same item** (throws in dev).
- **Title auto-fit** — a very long title steps its font size down in up to five steps (by
  character count) so it stays within ~two lines without resizing the card; the deeper steps
  let a much longer title fit before it has to ellipsize. The same ladder backs `StatCard`
  and `ContentCard`. (`PaperCard` does **not** use this ladder — its title wraps to three
  lines at a fixed size, then clips.)

> **`.mrs-stat-card__cta`** is a pre-styled CTA pill class for the freeform `footer`/`lower`
> slot — brand background, rounded, inherits font-size. Style it yourself or use this shortcut.

```tsx
// Plain stats row, no medallion:
<StatCard
  size="lg" tone="success" title="Vinnere" subtitle="Unike leverandører"
  watermark="🏆"
  stats={[{ value: 27, label: 'LEV' }, { value: 18, label: 'Bredde' }, { value: 14, label: 'Spisset' }]}
  lower={<button className="mrs-stat-card__cta" onClick={open}>🏆 Vis resultater →</button>}
  onClick={open}
/>

// Corner arc-ring medallion (value + max both required):
<StatCard
  size="lg" tone="warning" title="Leveransemodell"
  medallion={{ value: 10, max: 100 }} watermark="📊"
  stats={[{ value: 10, label: 'Vurdert' }, { value: 100, label: 'Totalt' }]}
/>

// Structured footer ({ lines, badges } — same shape as the other cards):
<StatCard size="xl" tone="info" title="Project Atlas"
  stats={[{ value: 12, label: 'TASKS' }, { value: 8, label: 'Done' }, { value: 3, label: 'Open' }]}
  footer={{ lines: [{ type: 'date', text: 'Jun 2026' }], badges: [<Badge tone="success">Live</Badge>] }}
/>

// Side completion gauge (red→amber→green) alongside the default top stripe:
<StatCard
  size="lg" tone="info" title="Onboarding" subtitle="Profile completeness"
  sideBarCompleteness={0.7}            // 0–1; `0` shows an empty gauge, `undefined` shows none
  stats={[{ value: 7, label: 'STEPS' }, { value: 7, label: 'Done' }, { value: 3, label: 'Left' }]}
/>

// One coherent colour — top stripe + stat numbers (and a medallion, if present) follow the gauge:
<StatCard
  size="lg" title="Onboarding" subtitle="Profile completeness"
  sideBarCompleteness={0.85}
  topStripeFollowsGauge          // tone/color ignored while a gauge is present
  stats={[{ value: 7, label: 'STEPS' }, { value: 6, label: 'Done' }, { value: 1, label: 'Left' }]}
/>
```

### `ContentCard`

The freeform-text counterpart to `StatCard` — same fixed-width golden-ratio sizing, accent
logic, variants, watermark, and footer structure, but the medallion + stats row is replaced
by a `content` string slot.

- **`content`** clamps to `maxLines`, which is **dynamic** by default: `5` if neither
  subtitle nor footer is present, `4` if either is, `3` if both are. Align it with
  `contentAlignX` (`left`·`center`·`right`) / `contentAlignY` (`top`·`center`·`bottom`).
- **`html`** — when `true`, `content` is parsed as HTML via `dangerouslySetInnerHTML` and
  **automatically sanitized** internally with `isomorphic-dompurify`.
- **Completion gauge** — `value` + `maxValue` render a left-side gauge (red→amber→green),
  the `ContentCard` equivalent of `StatCard`'s `sideBarCompleteness`.

```tsx
// Text content (centered):
<ContentCard size="md" tone="info" title="Status" content="All systems operational" />

// Left-aligned HTML content with a completion gauge:
<ContentCard
  size="lg" tone="success" title="Milestone 3"
  content="<b>Important:</b> Next phase begins early Q4. Ensure all deliverables are verified."
  html={true}
  contentAlignX="left"
  value={45} maxValue={50}
/>

// Warning variant (body text matches amber accent):
<ContentCard
  size="md" variant="warning" title="Pending review"
  content="3 items require your attention"
  lower={<button className="mrs-stat-card__cta" onClick={open}>Review now →</button>}
/>
```

### `PaperCard`

A small **preview / thumbnail** card styled as a dog-eared sheet of paper at **A4 portrait**
proportions (`height = width × √2`). The folded top-right corner is genuinely cut out of the
sheet with `clip-path`; the drop shadow lives on a wrapper via `filter: drop-shadow()` so it
follows the dog-eared silhouette (an ordinary `box-shadow` would be clipped away). Default
size is **`md`** (≈168px) — it's a thumbnail, not a full page; `sm` is a smaller, denser
thumbnail and `xxl` (320px) the largest preset.

It shares the card-family `footer`, `watermark`, hover-lift, `showDragHandle`, `corner`, and `renderLink`
seams. An accent stripe is **opt-in** (none by default — a paper card reads from its
proportion, fold, and shadow alone), and the folded corner stays a neutral surface tint even
when an accent is set. `content` clamps to `maxLines` (dynamic: `7` / `5` / `4`).

**`image` — a real preview layer, not a watermark.** `watermark` stays a faint, decorative
background glyph (string only). For an actual document preview/thumbnail — e.g. a rendered
PDF first page — pass a `<canvas>`/`<img>` to **`image`** instead: a full-opacity layer that
fills the sheet behind the title/footer, which render on top with a translucent scrim for
legibility.

```tsx
<PaperCard
  title="Invoice_2026_06.pdf" subtitle="Uploaded today"
  image={<img src={pdfThumbnailUrl} alt="" />}
  footer={{ lines: [{ type: 'date', text: '30 Jun 2026' }] }}
  renderLink={(p) => <Link {...p} to="/doc/$id" params={{ id }} />}
/>
```

The **`corner`** slot works the same way as on `DynamicGridCard`: a freeform `ReactNode`
(typically a `DropdownMenu` trigger) rendered above the link overlay as a sibling of the anchor,
so it stays clickable even when the whole card is a navigation link. It sits just below the
fold triangle height (via `top: var(--mrs-paper-fold)`) so the dog-ear remains visible; the
card automatically adds right-side padding to the title block so the corner never overlaps the
heading text.

```tsx
import { PaperCard, CardGrid } from 'my-react-shell/components'

// Plain thumbnail — title + meta only:
<PaperCard title="Errand list" subtitle="Personal" />

// With body text + a structured footer:
<PaperCard
  size="md"
  title="Quarterly report"
  subtitle="Q2 · Finance"
  content="Revenue up 12% QoQ; margins holding. Full breakdown attached."
  footer={{ lines: [{ type: 'date', text: '14 Jun 2026' }], badges: [<Badge tone="neutral">Draft</Badge>] }}
/>

// Opt-in accent + whole-card navigation link:
<PaperCard
  title="Proposal" subtitle="Acme · Sent" tone="primary"
  content="Two attachments. Awaiting countersignature."
  footer={{ badges: [<Badge tone="success">Active</Badge>] }}
  renderLink={(p) => <Link {...p} to="/doc/$id" params={{ id }} />}
/>

// Corner action slot — independently clickable even when the card is a nav link:
<PaperCard
  title="Quarterly report" subtitle="Q2 · Finance"
  content="Revenue up 12% QoQ; margins holding."
  corner={<DropdownMenu iconTrigger={<MoreVertical size={14} />} iconTriggerLabel="Card actions" items={[…]} />}
  renderLink={(p) => <Link {...p} to="/doc/$id" params={{ id }} />}
/>

// Fixed-size, so it drops into the static CardGrid:
<CardGrid>
  <PaperCard title="Meeting notes" subtitle="Standup" content="…" />
  <PaperCard title="To-do" content="…" />
</CardGrid>
```

### `PhiCard` *(legacy — being phased out)*

Prefer `StatCard` / `ContentCard` (self-contained, and the cards that carry the `renderLink`
navigation seam) for new work. `PhiCard` still ships so existing consumers keep building; it
gains no new features and has no `renderLink` nav seam.

A golden-ratio card: outer **W:H = φ:1**, the two sections split **φ:1**. A **figure**
(`icon` / `image`) fills its column, centered so the border→figure gap equals the
figure→content gap; the **text body** (`upper` + `content`) is vertically centered and
flush-left at the φ split (or the edge padding when there's no figure). Pass **both `icon`
and `upper`/`content`** → the original 1 : φ logo-and-title split; `iconFill` makes the icon
fill its column. The **bottom collapses when there's no footer** (the card shrinks to the
top band's height `W/φ²`). `size` also sets a base inherited `font-size`; `PHI`
(`1.6180339887`) is exported.

**Footer** — pass a structured `footer={{ lines, badges }}`: evenly-spread **rows**, each
pairing line[i] (left, with an optional `date`/`time`/`check` glyph the kit ships) with
badge[i] (right). Or use the freeform `lower` node. **Throws in dev** if both are given, or
if the per-size caps are exceeded — lines: sm 1 · md 2 · lg 3 · xl 5; badges: sm/md 1 · lg 2
· xl 4. Top-right **overflow menu**: pass `actions` for a ⋮ → Radix `DropdownMenu`; for
anything else use the `corner` slot (replaces the menu). The corner never triggers a
clickable card's `onClick`.

```tsx
<PhiCard
  size="lg"
  icon={<Hexagon />}
  iconFill
  upper={<><strong>Project Atlas</strong><span className="text-muted-foreground">Logo · title</span></>}
  footer={{
    lines: [{ type: 'date', text: '12 Jun 2026' }, { type: 'check', text: 'Reviewed' }],
    badges: [<Badge key="a" tone="success" dot>Live</Badge>, <Badge key="b">v2</Badge>],
  }}
  actions={[{ icon: <Pencil size={16} />, label: 'Edit', onSelect: onEdit }]}
/>

// no footer → the card collapses to the top band's height (W/φ²):
<PhiCard size="md" upper={<MyHeader />} />
```
