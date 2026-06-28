# Card Grid Layout Guide & Refactoring Manual

**Goal:** 
We are moving from a legacy fixed-size card architecture to a modern, fluid CSS Grid architecture. Cards should have a fixed gap, wrap cleanly, and stretch uniformly across rows to fill available space without leaving large gaps at the end. 

This document serves as the guide for the new grid layout and the **active refactoring effort** to port legacy cards to this new paradigm.

## 1. The Paradigm Shift (Old vs. New)

### The Legacy Paradigm (`PhiCard`, `StatCard`, `ContentCard`)
- **Rigid Dimensions:** The `size` prop (`sm`, `md`, `lg`, `xl`) was used to assign an absolute **fixed width** in pixels (e.g., `md` = 240px). 
- **Fixed Height:** Height was strictly calculated via the Golden Ratio (`height = width / PHI`).
- **No Stretching:** These cards did not stretch to fill containers, leading to awkward gaps.

### The New Paradigm (`CardGrid`, `BaseCard`, `GridCard`)
- **Fluid Grid:** The layout is driven by a CSS Grid container (`CardGrid`) using `1fr` columns.
- **Dynamic Stretching:** Cards take `width: 100%` to effortlessly conform to their grid column.
- **New Meaning of `size`:** A `size` prop on a card *no longer* sets a rigid pixel width. Instead, it applies a `max-width` limit to prevent the card from stretching into a grotesque shape if it ends up alone on a sparse row.

---

## 2. Using the New Grid System

To achieve uniform stretching and clean wrapping, we use **CSS Grid** with a specific inheritance pattern. 

### The Container (`CardGrid`)
The grid dictates the columns: `grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--mrs-card-grid-min)), 1fr))`. 
By passing a `cardSize` prop to `CardGrid` (e.g., `<CardGrid cardSize="sm">`), it emits two CSS variables down the DOM tree:
* `--mrs-card-grid-min`: Minimum column width (e.g., `180px`).
* `--mrs-card-grid-item-max`: Maximum stretch limit for a card (e.g., `240px`).

### The Cards (`GridCard`, `BaseCard`)
Cards take `width: 100%`. They inherit the grid's maximum stretch limit:
`max-width: var(--mrs-grid-card-max-width, var(--mrs-card-grid-item-max, 100%));`
If the grid column stretches wider than the card's maximum width, `margin: 0 auto` keeps the card centered within its lane.

> [!WARNING]
> **Usage Rule for Agents:** 
> Do **NOT** set the `size` prop directly on individual cards (e.g., `<GridCard size="sm">`) when placing them in a grid.
> You must ALWAYS set the size on the parent container instead: `<CardGrid cardSize="sm">`. 
> The cards will automatically inherit the correct grid boundaries and `max-width` limits.

### Supported Semantic Sizes

We currently support exactly **3 semantic card sizes**:

| Size | Minimum Column Width | Maximum Stretch Limit | Best For |
| :--- | :--- | :--- | :--- |
| **`sm`** (Small) | 180px | 210px | Dense data, small metrics, minimal list items. |
| **`md`** (Medium) | 240px | 320px | Standard content, typical dashboard widgets. |
| **`lg`** (Large) | 400px | 500px | Featured content, complex forms, wide charts. |

*(Note: There is no extra-large (`xl`) card size. If a layout requires a massive span, use specialized layout components.)*

---

## 3. Porting Legacy Cards (Actionable Guide)

> [!IMPORTANT]
> **Active Refactoring Effort:** We are currently porting legacy cards (`StatCard`, `ContentCard`) to the new Grid Card concept.

When you are tasked with porting a legacy card to the new architecture, follow these steps:

1. **Remove Fixed Width/Height Calculations:**
   Strip out any code that calculates `width` in absolute pixels or sets `height` strictly as `width / PHI`. The physical boundaries are now delegated to `BaseCard` or the new grid structure.

2. **Re-map the `size` Prop:**
   Change the `size` prop's type from `PhiCardSize` to `GridCardSize` (which drops the `xl` option). Pass this `size` prop down to the underlying `BaseCard` or `GridCard` so it acts as a `max-width` stretch cap, NOT a fixed width.

3. **Use the New Base Components:**
   Instead of reinventing the structural DOM, rebuild the card by composing it inside a `<BaseCard>`. `BaseCard` will automatically handle the stretching `width: 100%` and the `max-width` limit. 

4. **Preserve Proportions (Variants):**
   Rely on the `variant` prop (`standard` for `φ : 1` or `landscape` for `φ² : 1`) provided by `BaseCard` to maintain the Golden Ratio proportions dynamically, rather than hardcoding height calculations.

5. **Demo Updates:**
   If a component is fully ported, ensure the `my-react-shell-demo` consumes it via a `<CardGrid>` wrapper and removes any manual `size` props from the individual cards.
