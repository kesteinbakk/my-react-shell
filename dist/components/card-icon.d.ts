import { type ReactNode } from 'react';
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
export type CardIconPlacement = 'upperLeft' | 'upperRight' | 'lowerLeft' | 'lowerRight' | 'center' | 'title';
/** The `{ content, placement }` object form of a card `icon` — see {@link CardIconPlacement}. */
export interface CardIconConfig<T = ReactNode> {
    /** The icon/emoji/glyph content. */
    content: T;
    /** Where the icon renders. Default `'title'`. */
    placement?: CardIconPlacement;
}
/**
 * Discriminate the `{ content, placement }` icon config from a bare `ReactNode` shorthand.
 * A config is a plain object carrying `content`; a React element, array, or primitive is the
 * shorthand (implies `{ content: icon, placement: 'title' }`).
 */
export declare function isIconConfig(icon: ReactNode | CardIconConfig): icon is CardIconConfig;
