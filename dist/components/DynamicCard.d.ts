import { type HTMLAttributes, type ReactNode } from 'react';
import type { AccentPlacement } from './accent';
import type { Tone } from './tone';
import { type CardIconPlacement, type CardIconConfig } from './card-icon';
export type DynamicCardSize = 'sm' | 'md' | 'lg';
/**
 * Carries the enclosing `DynamicCards`'s `cardSize` down to each `DynamicCard` so it
 * can resolve its own effective size (for the icon/title scale below) without the consumer
 * having to repeat `size` on every card — the grid is still what drives the column width.
 */
export declare const DynamicCardsSizeContext: import("react").Context<DynamicCardSize | undefined>;
/** Proportion of the card: `'standard'` is φ:1; `'landscape'` is the shorter-wider φ²:1. */
export type DynamicCardShape = 'standard' | 'landscape';
/** Where a `DynamicCard` `icon` renders — see {@link CardIconPlacement}. */
export type DynamicCardIconPlacement = CardIconPlacement;
/** The `{ content, placement }` object form of `icon` — see {@link DynamicCardIconPlacement}. */
export type DynamicCardIconConfig = CardIconConfig;
/** Leading glyph kind for a structured footer meta line. */
export type DynamicCardFooterLineType = 'date' | 'time' | 'check';
/** One left-side footer line: text with an optional kit-shipped leading glyph. */
export interface DynamicCardFooterLine {
    text: ReactNode;
    type?: DynamicCardFooterLineType;
}
/** Structured footer: meta lines on the left, badges stacked on the right. */
export interface DynamicCardFooter {
    lines?: DynamicCardFooterLine[];
    badges?: ReactNode[];
}
/**
 * Props the card hands the consumer's {@link DynamicCardProps.renderLink} callback to
 * spread onto its router `<Link>`. The card supplies the overlay `className` and an
 * auto-wired `aria-labelledby` pointing at the card's title; the consumer adds `to`/`params`.
 */
export interface DynamicCardLinkProps {
    className: string;
    'aria-labelledby'?: string;
}
export interface DynamicCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    /**
     * Steps the card's own width cap down from the enclosing `DynamicCards`'s `cardSize`
     * toward the next-smaller tier, in fifths: `0` (default) is the grid's own cap, `5` is the
     * next-smaller tier's cap. Typography/icon scale always follow the grid's `cardSize` (or
     * `'md'` when there's no enclosing grid) — `sizeLimit` only narrows the width, so a stepped
     * card keeps the larger tier's text/icon scale. No effect on a card whose effective size is
     * already the smallest tier (`'sm'`) — there's nothing smaller to step toward.
     */
    sizeLimit?: 0 | 1 | 2 | 3 | 4 | 5;
    /** Proportion of the card. Default `'standard'` (φ:1); `'landscape'` is φ²:1 (shorter, wider). */
    shape?: DynamicCardShape;
    title?: ReactNode;
    subtitle?: ReactNode;
    /**
     * Icon/emoji glyph. A bare `ReactNode` is shorthand for `{ content, placement: 'title' }`
     * (today's behavior: rendered beside the title block). Pass the full
     * `{ content, placement }` form to place it in a corner (never affects layout) or `'center'`
     * (replaces `children`) — see {@link DynamicCardIconPlacement}.
     */
    icon?: ReactNode | DynamicCardIconConfig;
    /**
     * Cursor + hover feedback + `:focus-visible` ring on the card root. Defaults to `true` when
     * `onClick` is set. The default hover feedback is a subtle background tint
     * (`--color-surface-raised`) — see `lift` to additionally move the card.
     */
    hoverable?: boolean;
    /**
     * Adds a `translateY` lift + stronger shadow on top of the default hover tint. Defaults to
     * `false` — the tint alone is the hover feedback for most cards; opt into the extra movement
     * for cards where a more pronounced affordance reads better. No effect unless `hoverable`.
     */
    lift?: boolean;
    /**
     * Faint background watermark behind the card content, centred horizontally and dropped a
     * little below the card's vertical centre.
     *
     * - A **string** is an emoji/text watermark (e.g. `'🚀'`), drawn oversized via a pseudo-element.
     * - A **`ReactNode`** (e.g. a {@link DrawerMark}) is rendered in a faint art layer; the card
     *   root becomes a `mrs-reveal-host`, so a hover-reveal mark dropped here opens on card hover.
     */
    watermark?: ReactNode;
    /**
     * For a **`ReactNode`** watermark only (ignored for a string watermark): scales the node's
     * intrinsic `<svg>` / `<img>` / `<span>` size up to watermark scale, oversized and faint, mirroring
     * the string-emoji watermark — the right behavior for a small icon-kit glyph: a lucide `<svg>`, an
     * emoji drawn as a bundled `<img>` asset, or a native-char span (e.g. `<AppIcon>`).
     *
     * Set `false` for a self-sized illustration (e.g. `DrawerMark`) that already lays itself out
     * at watermark scale and shouldn't be force-scaled. Default `true`.
     */
    autoscaleWatermark?: boolean;
    /**
     * Top-corner action slot (e.g. a `DropdownMenu` trigger). Rendered above the link overlay
     * (`z-index`) so it stays independently clickable — a sibling of the anchor, never nested in it.
     */
    corner?: ReactNode;
    /**
     * Footer slot: either a freeform node (e.g. a meta row) or a structured
     * `{ lines, badges }` (meta lines on the left, badges stacked on the right).
     */
    footer?: ReactNode | DynamicCardFooter;
    /**
     * Interactive-root seam. The consumer renders its own router `<Link>` here, spreading the
     * supplied props, and the card mounts it as a **full-bleed block-link overlay** so the whole
     * tile is a real, keyboard-activatable anchor — while the card root stays a `<div>` that owns
     * its hover/border/focus states. The shell imports no router; `to`/`params` type-safety lives
     * at the call site:
     *
     * ```tsx
     * renderLink={(p) => <Link {...p} to="/setup/$id" params={{ id }} />}
     * ```
     */
    renderLink?: (linkProps: DynamicCardLinkProps) => ReactNode;
    /**
     * Shows the built-in grip handle — vertical stripes pinned to the right edge,
     * vertically centred. Pair with `dragHandleProps` to wire your DND library.
     *
     * Mutually exclusive with `renderLink` (a nav tile isn't drag-reorderable).
     */
    showDragHandle?: boolean;
    /**
     * A custom drag handle node, rendered in place of the built-in grip (implies a
     * visible handle, so `showDragHandle` isn't also needed). Wire it with `dragHandleProps`.
     */
    dragHandle?: ReactNode;
    /**
     * The event listeners and attributes from your DND library (e.g. `@dnd-kit`),
     * spread onto the drag handle element.
     */
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
    /**
     * Accessible label for the drag handle. No default — pass a translated string (or supply
     * `aria-label` via `dragHandleProps`); absent → no label (the grip glyph stands alone).
     */
    dragHandleLabel?: string;
    /**
     * Switches the root cursor to grab/grabbing and spreads `dragHandleProps` onto the card root
     * (suppressing the default visual drag handle).
     */
    dragWholeCard?: boolean;
    /**
     * Semantic tone — drives an optional accent stripe. Default **none** (no accent).
     * Ignored when `color` is set. Same accent vocabulary as `StatCard`/`PaperCard`.
     */
    tone?: Tone;
    /** Raw CSS color string for the accent stripe; overrides `tone`. */
    color?: string;
    /** Where the accent reads when `tone`/`color` is set: a `'top'` stripe (default) or a `'left'` bar. */
    accentPlacement?: AccentPlacement;
}
export declare const DYNAMIC_CARD_MIN_WIDTH: Record<DynamicCardSize, number>;
export declare const DYNAMIC_CARD_MAX_WIDTH: Record<DynamicCardSize, number>;
/**
 * Fluid card for the {@link DynamicCards}: it stretches to `width: 100%` of its
 * grid column and inherits the grid's max-width cap, keeping the golden-ratio shape via
 * `aspect-ratio`. Accepts optional named slots (`title`, `subtitle`, `icon`, `footer`)
 * with the primary content passed as `children`.
 *
 * It can act as a **whole-card navigation link** without the shell depending on any router:
 * pass `renderLink` and the card mounts the consumer's `<Link>` as a full-bleed block-link
 * overlay, with `corner` controls raised above it so they stay independently clickable.
 */
export declare const DynamicCard: import("react").ForwardRefExoticComponent<DynamicCardProps & import("react").RefAttributes<HTMLDivElement>>;
