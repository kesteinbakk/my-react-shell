# Card Grid Layout Guide

**Goal:** 
User wants a card grid where cards have a fixed gap between them and where cards wrap to fit. User wants cards to stretch within certain limits (e.g., restricted to card size minimums like sm, md, lg), so cards can better fill the whole space without large gaps either at the end or in between. They also want all cards to be uniformly sized across all rows (no single stretched card on the last row). This is a guide for new agents working on cards.

## How We Achieved It (The Solution)

To achieve uniform stretching, clean wrapping, and zero intra-cell gaps, we must use **CSS Grid** for the layout, but with a specific pattern:

1. **Dynamic Grid Columns:** 
   The grid container (`CardGrid`) uses `grid-template-columns: repeat(auto-fill, minmax(var(--mrs-card-grid-min), 1fr))`. We dynamically pass the intended minimum width of the cards as a CSS variable (`--mrs-card-grid-min`) to the grid container based on the card variant being rendered (e.g., passing `180px` for a grid of `sm` cards).

2. **Cards Conform to the Grid:**
   The cards themselves (`BaseCard`, `StatCard`, `PhiCard`) must **NOT** have a `max-width` or `flex` property. They must simply have `width: 100%`.
   
**Why this works:**
Because the `1fr` property on the CSS Grid dictates the width across the *entire grid block* rather than on a per-row basis, every single column is perfectly uniform. By not restricting the card with `max-width`, the card simply takes `width: 100%` of that perfectly uniform column. If the grid expands the columns to 240px to fill the remaining space, all cards stretch to exactly 240px. The math guarantees no extra space is left over, preventing "crazy gaps".

## BaseCard and GridCard Variants

Both `BaseCard` and its expanded counterpart `GridCard` maintain the structural proportion of the golden ratio (φ) by default. They provide two variants to support different layout needs without breaking the grid mathematically:

1. **`standard` (default):** Aspect ratio is `φ : 1` (1.618). This is the default card shape.
2. **`landscape`:** Aspect ratio is `φ² : 1` (2.618). This is a shorter, wider variant that corresponds to the proportion of a `PhiCard` without a footer section. This variant allows grids to remain uniform when building out single-section strips or banners.

## Current Status
- `GridCard` has been introduced as a semantic layout card that builds on `BaseCard`'s stretching behavior. It accepts optional `title`, `subtitle`, and `footer` props, with the primary content passed cleanly as idiomatic React `children`.
- The `my-react-shell-demo` visual showcase now uses `GridCard` to demonstrate structural stretching.
- `PhiCard` is currently parked for future refactoring and has not yet been deleted or ported to use `GridCard`.
