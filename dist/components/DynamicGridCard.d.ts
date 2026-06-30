import { type HTMLAttributes, type ReactNode } from 'react';
import type { AccentPlacement } from './accent';
import type { Tone } from './tone';
export type DynamicGridCardSize = 'sm' | 'md' | 'lg';
/** Proportion of the card: `'standard'` is φ:1; `'landscape'` is the shorter-wider φ²:1. */
export type DynamicGridCardShape = 'standard' | 'landscape';
/** Leading glyph kind for a structured footer meta line. */
export type DynamicGridCardFooterLineType = 'date' | 'time' | 'check';
/** One left-side footer line: text with an optional kit-shipped leading glyph. */
export interface DynamicGridCardFooterLine {
    text: ReactNode;
    type?: DynamicGridCardFooterLineType;
}
/** Structured footer: meta lines on the left, badges stacked on the right. */
export interface DynamicGridCardFooter {
    lines?: DynamicGridCardFooterLine[];
    badges?: ReactNode[];
}
/**
 * Props the card hands the consumer's {@link DynamicGridCardProps.renderLink} callback to
 * spread onto its router `<Link>`. The card supplies the overlay `className` and an
 * auto-wired `aria-labelledby` pointing at the card's title; the consumer adds `to`/`params`.
 */
export interface DynamicGridCardLinkProps {
    className: string;
    'aria-labelledby'?: string;
}
export interface DynamicGridCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    size?: DynamicGridCardSize;
    /** Proportion of the card. Default `'standard'` (φ:1); `'landscape'` is φ²:1 (shorter, wider). */
    shape?: DynamicGridCardShape;
    title?: ReactNode;
    subtitle?: ReactNode;
    /** Icon/emoji column rendered beside the title (a figure-split header). */
    figure?: ReactNode;
    /** Cursor + hover-lift + `:focus-visible` ring on the card root. */
    hoverable?: boolean;
    /**
     * Whether the `hoverable` card lifts (`translateY`) on hover. Defaults to `true`. Set `false`
     * to keep the card interactive — cursor, `onClick`, and a subtle hover elevation — **without**
     * the movement (e.g. when the card carries a `DrawerMark` whose own open-on-hover is the
     * feedback). No effect unless `hoverable` is set.
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
     * Top-corner action slot (e.g. a `DropdownMenu` trigger). Rendered above the link overlay
     * (`z-index`) so it stays independently clickable — a sibling of the anchor, never nested in it.
     */
    corner?: ReactNode;
    /**
     * Footer slot: either a freeform node (e.g. a meta row) or a structured
     * `{ lines, badges }` (meta lines on the left, badges stacked on the right).
     */
    footer?: ReactNode | DynamicGridCardFooter;
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
    renderLink?: (linkProps: DynamicGridCardLinkProps) => ReactNode;
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
export declare const DYNAMIC_GRID_CARD_MIN_WIDTH: Record<DynamicGridCardSize, number>;
export declare const DYNAMIC_GRID_CARD_MAX_WIDTH: Record<DynamicGridCardSize, number>;
/**
 * Fluid card for the {@link DynamicCardGrid}: it stretches to `width: 100%` of its
 * grid column and inherits the grid's max-width cap, keeping the golden-ratio shape via
 * `aspect-ratio`. Accepts optional named slots (`title`, `subtitle`, `figure`, `footer`)
 * with the primary content passed as `children`.
 *
 * It can act as a **whole-card navigation link** without the shell depending on any router:
 * pass `renderLink` and the card mounts the consumer's `<Link>` as a full-bleed block-link
 * overlay, with `corner` controls raised above it so they stay independently clickable.
 */
export declare const DynamicGridCard: import("react").ForwardRefExoticComponent<DynamicGridCardProps & import("react").RefAttributes<HTMLDivElement>>;
