# Card Grid Layout Guide

**Goal:** 
User wants a card grid where cards have a fixed gap between them and where cards wrap to fit. User wants cards to stretch within certain limits (e.g., restricted to card size minimums like sm, md, lg), so cards can better fill the whole space without large gaps either at the end or in between. They also want all cards to be uniformly sized across all rows (no single stretched card on the last row). This is a guide for new agents working on cards.

## How We Achieved It (The Solution)

To achieve uniform stretching, clean wrapping, and zero intra-cell gaps, we use **CSS Grid** for the layout with a specific inheritance pattern:

1. **Dynamic Grid Columns (The Grid Container):** 
   The grid container (`CardGrid`) uses `grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--mrs-card-grid-min)), 1fr))`. 
   By passing a `cardSize` prop to `CardGrid` (e.g., `cardSize="sm"`), it automatically calculates and emits two CSS variables down the DOM tree:
   * `--mrs-card-grid-min`: The minimum width of a grid column (e.g., `180px`).
   * `--mrs-card-grid-item-max`: The maximum width a card inside this grid should ever grow to (e.g., `240px`).

   Because we use `auto-fill` and `1fr`, the grid creates uniform columns that stretch equally to fill the container without leaving "crazy gaps" at the right edge.

2. **Cards Conform & Self-Limit (The Card Components):**
   The cards themselves (like `GridCard`) take `width: 100%` to flawlessly conform to their grid column. 
   However, to prevent over-stretching in edge cases (e.g., a 400px wide container that can only fit 1 column), cards define a `max-width` limit that inherits the grid's constraint:
   `max-width: var(--mrs-grid-card-max-width, var(--mrs-card-grid-item-max, 100%));`
   
   If the grid column stretches wider than the card's maximum width, `margin: 0 auto` ensures the card stays beautifully centered within its lane.

**Why this works:**
It provides the best of both worlds. The grid dictating the columns via `1fr` guarantees that all columns are uniform across all rows. The cards stretching to `100%` ensures they fill those uniform columns perfectly. And the inherited `max-width` with auto-margins ensures that in sparse grid scenarios, cards never look grotesquely stretched.

## Supported Card Sizes

We currently support exactly **3 semantic card sizes**. By passing one of these sizes to `<CardGrid cardSize="...">`, the grid automatically configures its column minimums and applies a sensible max-width cap to prevent awkward stretching:

| Size | Minimum Column Width | Maximum Stretch Limit | Best For |
| :--- | :--- | :--- | :--- |
| **`sm`** (Small) | 180px | 210px | Dense data, small metrics, minimal list items. |
| **`md`** (Medium) | 240px | 320px | Standard content, typical dashboard widgets. |
| **`lg`** (Large) | 400px | 500px | Featured content, complex forms, wide charts. |

*(Note: There is no extra-large (`xl`) card size. If a layout requires a massive span, consider specialized layout components rather than a standard card grid.)*

## BaseCard and GridCard Variants

Both `BaseCard` and its expanded counterpart `GridCard` maintain the structural proportion of the golden ratio (φ) by default. They provide two variants to support different layout needs without breaking the grid mathematically:

1. **`standard` (default):** Aspect ratio is `φ : 1` (1.618). This is the default card shape.
2. **`landscape`:** Aspect ratio is `φ² : 1` (2.618). This is a shorter, wider variant that corresponds to the proportion of a `PhiCard` without a footer section. This variant allows grids to remain uniform when building out single-section strips or banners.

## Current Status
- `GridCard` has been introduced as a semantic layout card that builds on `BaseCard`'s stretching behavior. It accepts optional `title`, `subtitle`, and `footer` props, with the primary content passed cleanly as idiomatic React `children`.
- The `my-react-shell-demo` visual showcase has been structurally reorganized into dedicated top-level pages. Pure un-opinionated containers are grouped under the "Surfaces" section, while grid behavior and layout scaling are demonstrated in a dedicated "Card Grids" section.
