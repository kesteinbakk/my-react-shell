import { type MouseEventHandler, type ReactNode } from 'react';
import type { AccentPlacement } from './accent';
import type { Tone } from './tone';
import { type DynamicCardGridProps } from './DynamicCardGrid';
/**
 * Props the tile hands the consumer's {@link DynamicNavCard.renderLink} callback to spread
 * onto its router `<Link>`. The tile supplies the overlay `className` and an auto-wired
 * `aria-labelledby` pointing at the tile's title; the consumer adds `to`/`params`.
 */
export interface DynamicNavCardLinkProps {
    className: string;
    'aria-labelledby'?: string;
}
/**
 * One navigation tile's content, returned by {@link DynamicNavCardsProps.getCard}. A
 * **lean** nav tile — its own element (it does **not** wrap `DynamicGridCard`) whose single
 * `title` renders as large, centred main content that scales up when the label is short and
 * steps down (clamped at two lines) as it grows.
 */
export interface DynamicNavCard {
    /**
     * The tile's label — its **centred main content**. **Required, no default** — it's
     * user-facing text, so the consumer supplies a translated string. Rendered large when the
     * label is short and stepped down as it lengthens, clamped at two lines.
     */
    title: ReactNode;
    /**
     * Whole-tile navigation seam. The consumer renders its own router `<Link>` here, spreading
     * the supplied props, and the tile mounts it as a **full-bleed block-link overlay** so the
     * whole tile is a real, keyboard-activatable anchor — while the tile root stays a `<div>`
     * that owns its hover/border/focus states. The overlay's accessible name is auto-wired from
     * `title`. The shell imports no router; `to`/`params` type-safety lives at the call site:
     *
     * ```tsx
     * renderLink={(p) => <Link {...p} to="/setup/$id" params={{ id }} />}
     * ```
     */
    renderLink?: (linkProps: DynamicNavCardLinkProps) => ReactNode;
    /** Click handler for a non-link tile. Sets the hoverable affordance by default. */
    onClick?: MouseEventHandler<HTMLDivElement>;
    /**
     * Cursor + hover feedback + `:focus-visible` ring. Defaults to `true` when `onClick` is
     * set. The default hover feedback is a subtle background tint — see `lift` to additionally
     * move the tile. A `renderLink` tile always carries the linked hover state.
     */
    hoverable?: boolean;
    /** Adds a `translateY` lift + stronger shadow on top of the hover tint. No effect unless hoverable. */
    lift?: boolean;
    /** Semantic tone — drives an optional accent stripe. Default **none**. Ignored when `color` is set. */
    tone?: Tone;
    /** Raw CSS color string for the accent stripe; overrides `tone`. */
    color?: string;
    /** Where the accent reads when `tone`/`color` is set: a `'top'` stripe (default) or a `'left'` bar. */
    accentPlacement?: AccentPlacement;
    /** Footer slot — a freeform node (e.g. a meta line) pinned to the bottom of the tile. */
    footer?: ReactNode;
    /** Top-corner action slot (e.g. a menu trigger). Raised above the link overlay so it stays clickable. */
    corner?: ReactNode;
    /**
     * Faint background watermark behind the content, centred horizontally and dropped a little
     * below centre. A **string** is an emoji/text watermark drawn via a pseudo-element; a
     * **`ReactNode`** renders in a faint art layer (the tile root becomes a `mrs-reveal-host`).
     */
    watermark?: ReactNode;
    /**
     * For a **`ReactNode`** watermark only: scales the node's intrinsic `<svg>`/`<img>`/`<span>`
     * up to watermark scale, oversized and faint. Set `false` for a self-sized illustration
     * (e.g. `DrawerMark`). Default `true`.
     */
    autoscaleWatermark?: boolean;
    /** Extra class on the tile root. */
    className?: string;
}
/**
 * Props for {@link DynamicNavCards}. The full {@link DynamicCardGridProps} surface — items,
 * search / filter / sort, `cardSize`, `align`, loading / empty states, `minColumnWidth` —
 * **minus** `renderCard`, which is replaced by `getCard`: a map from each item to its
 * {@link DynamicNavCard} spec.
 */
export interface DynamicNavCardsProps<T> extends Omit<DynamicCardGridProps<T>, 'renderCard'> {
    /** Maps one item to its nav tile's content — the nav equivalent of the grid's `renderCard`. */
    getCard: (item: T) => DynamicNavCard;
}
/**
 * A **self-contained grid of navigation tiles**. Unlike the card family it renders its own
 * lean tile element (it does **not** use `DynamicGridCard`), but it drives that grid through
 * the same {@link DynamicCardGrid} — so it inherits its fluid `1fr` columns, `cardSize`
 * scale, and the built-in search / filter / sort toolbar. Each tile's single `title` grows
 * large when the label is short and steps down (clamped at two lines) as it lengthens, so a
 * grid of short nav labels reads big and bold.
 *
 * Drive it like `DynamicCardGrid`, but map each item to a tile with `getCard` instead of
 * `renderCard`:
 *
 * ```tsx
 * <DynamicNavCards
 *   items={areas}
 *   getKey={(a) => a.id}
 *   cardSize="md"
 *   getCard={(a) => ({ title: a.name, renderLink: (p) => <Link {...p} to={a.to} /> })}
 * />
 * ```
 */
export declare function DynamicNavCards<T>({ getCard, ...gridProps }: DynamicNavCardsProps<T>): import("react").JSX.Element;
