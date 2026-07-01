import { isValidElement, type ReactNode } from 'react'

/**
 * Shared icon-placement vocabulary for the card family (`StatCard`, `ContentCard`,
 * `PaperCard`, `DynamicGridCard`). Each card re-exports these under its own named aliases
 * (`StatCardIconPlacement`, …) for public-API naming consistency, but the underlying type,
 * config shape, and runtime discriminator live here so the four cards stay unified.
 *
 * - `'title'` (default) — inline in the header, beside the title block. Part of the document
 *   flow: it pushes/sizes alongside the title/subtitle.
 * - `'upperLeft'` / `'upperRight'` / `'lowerLeft'` / `'lowerRight'` — an absolutely positioned
 *   corner overlay. Never affects layout (never pushes title/body/footer).
 * - `'center'` — replaces the card's main content area.
 */
export type CardIconPlacement = 'upperLeft' | 'upperRight' | 'lowerLeft' | 'lowerRight' | 'center' | 'title'

/** The `{ content, placement }` object form of a card `icon` — see {@link CardIconPlacement}. */
export interface CardIconConfig<T = ReactNode> {
  /** The icon/emoji/glyph content. */
  content: T
  /** Where the icon renders. Default `'title'`. */
  placement?: CardIconPlacement
}

/**
 * Discriminate the `{ content, placement }` icon config from a bare `ReactNode` shorthand.
 * A config is a plain object carrying `content`; a React element, array, or primitive is the
 * shorthand (implies `{ content: icon, placement: 'title' }`).
 */
export function isIconConfig(icon: ReactNode | CardIconConfig): icon is CardIconConfig {
  return typeof icon === 'object' && icon !== null && !isValidElement(icon) && !Array.isArray(icon) && 'content' in icon
}

/**
 * Resolve the requested placement to the one actually rendered. `'upperLeft'` sits at the same
 * top-left corner where the `title`/`subtitle` block starts — with either present, the corner
 * overlay would land on top of that text, so it falls back to `'title'` (in-flow, beside the
 * title) instead. Silent, not a dev-throw: unlike the per-card slot collisions (e.g. `'upperRight'`
 * vs `medallion`), this isn't an opt-in combination the consumer chose to combine — `title` is
 * mandatory on three of the four cards, so treating it as an error would make `'upperLeft'`
 * effectively unusable there.
 */
export function resolveCardIconPlacement(
  placement: CardIconPlacement,
  hasTitleOrSubtitle: boolean,
): CardIconPlacement {
  if (placement === 'upperLeft' && hasTitleOrSubtitle) return 'title'
  return placement
}
