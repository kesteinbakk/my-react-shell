import { type ReactNode } from 'react';
import { type DynamicGridCardProps, type DynamicGridCardShape, type DynamicGridCardSize, type DynamicGridCardFooter, type DynamicGridCardFooterLine, type DynamicGridCardFooterLineType, type DynamicGridCardLinkProps } from './DynamicGridCard';
/** Proportion of the card — the same axis as {@link DynamicGridCardShape}. */
export type NavCardShape = DynamicGridCardShape;
/** Size — the same scale as {@link DynamicGridCardSize}. Defaults to `md`. */
export type NavCardSize = DynamicGridCardSize;
/** Structured footer — inherited from {@link DynamicGridCardFooter}. */
export type NavCardFooter = DynamicGridCardFooter;
/** One left-side footer line — inherited from {@link DynamicGridCardFooterLine}. */
export type NavCardFooterLine = DynamicGridCardFooterLine;
/** Leading glyph kind for a footer line — inherited from {@link DynamicGridCardFooterLineType}. */
export type NavCardFooterLineType = DynamicGridCardFooterLineType;
/** Props the card hands the consumer's `renderLink` callback — see {@link DynamicGridCardLinkProps}. */
export type NavCardLinkProps = DynamicGridCardLinkProps;
/**
 * Props for {@link NavCard}. The full {@link DynamicGridCardProps} surface **minus**
 * `icon` (unsupported) and `subtitle`/`children` (its only content is `title`).
 * Everything else — `size` (defaults to `md`), `renderLink`, `footer`, `corner`, `tone`/
 * `color` accent, `watermark`, the drag seam, `hoverable`/`lift`, `shape` — is inherited.
 */
export interface NavCardProps extends Omit<DynamicGridCardProps, 'icon' | 'subtitle' | 'children' | 'title'> {
    /**
     * The nav tile's label. Rendered as the card's **centred main content** (passed into
     * `DynamicGridCard`'s body), not a header. **Required, no default** — it's user-facing
     * text, so the consumer supplies a translated string.
     */
    title: ReactNode;
}
/**
 * A small **navigation-tile** variant of {@link DynamicGridCard}. It carries no `icon`;
 * its single `title` renders as the card's centred main content rather than a header.
 * Reach for it to build a grid of navigation links — pair it with `renderLink` for
 * whole-card navigation.
 *
 * Everything beyond icon/content is inherited from `DynamicGridCard`: `size` (defaults
 * to `md`), `renderLink` whole-card navigation (with the accessible name auto-wired from
 * `title`), `footer`, `corner`, `tone`/`color` accent, `watermark`, the drag-reorder seam,
 * `hoverable`/`lift`, and `shape`.
 */
export declare const NavCard: import("react").ForwardRefExoticComponent<NavCardProps & import("react").RefAttributes<HTMLDivElement>>;
