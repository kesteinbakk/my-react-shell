import { type CSSProperties, type ReactNode } from 'react';
import type { AccentPlacement } from './accent';
import type { Tone } from './tone';
import { type CardIconPlacement, type CardIconConfig } from './card-icon';
/**
 * Size preset — a fixed-width golden-ratio card (`height = width / φ`). `md` (≈312px,
 * four to a `wide` 1440px row) is the default. Self-contained — no longer derived from `PhiCard`.
 */
export type ContentCardSize = 'sm' | 'md' | 'lg' | 'xl';
/** Leading glyph kind for a footer meta line. */
export type ContentCardFooterLineType = 'date' | 'time' | 'check';
/** One left-side footer line: text with an optional kit-shipped leading glyph. */
export interface ContentCardFooterLine {
    text: ReactNode;
    type?: ContentCardFooterLineType;
}
/** Structured footer: meta lines on the left, badges stacked on the right. */
export interface ContentCardFooter {
    lines?: ContentCardFooterLine[];
    badges?: ReactNode[];
}
/** Proportion of the card: `'standard'` is φ:1 (`height = width / φ`); `'landscape'` is the shorter-wider φ²:1 (`height = width / φ²`). */
export type ContentCardShape = 'standard' | 'landscape';
/**
 * Props the card hands the consumer's {@link ContentCardProps.renderLink} callback to spread onto
 * its router `<Link>`. The card supplies the overlay `className` and an auto-wired
 * `aria-labelledby` pointing at the card's title; the consumer adds `to`/`params`.
 */
export interface ContentCardLinkProps {
    className: string;
    'aria-labelledby'?: string;
}
export type ContentCardTone = Tone;
export type ContentCardVariant = 'warning' | 'danger';
/** Where a `ContentCard` `icon` renders — see {@link CardIconPlacement}. */
export type ContentCardIconPlacement = CardIconPlacement;
/** The `{ content, placement }` object form of `icon` — see {@link ContentCardIconPlacement}. */
export type ContentCardIconConfig = CardIconConfig;
export interface ContentCardBaseProps {
    title: string;
    subtitle?: string;
    /**
     * Icon/emoji glyph. A bare `ReactNode` is shorthand for `{ content, placement: 'title' }`
     * (rendered inline beside the title block). Pass the full `{ content, placement }` form to
     * place it in a corner (never affects layout) or `'center'` (replaces the `content`/`children`
     * body) — see {@link ContentCardIconPlacement}.
     *
     * `'center'` can't combine with `content`/`children` (both own the card body) — throws in dev.
     */
    icon?: ReactNode | ContentCardIconConfig;
    contentAlignX?: 'left' | 'center' | 'right';
    contentAlignY?: 'top' | 'center' | 'bottom';
    value?: number;
    maxValue?: number;
    maxLines?: number;
    tone?: ContentCardTone;
    color?: string;
    accentPlacement?: AccentPlacement;
    topStripeFollowsGauge?: boolean;
    variant?: ContentCardVariant;
    /**
     * Footer slot: either a freeform `ReactNode` or a structured `{ lines, badges }`
     * (meta lines on the left, badges on the right).
     */
    footer?: ReactNode | ContentCardFooter;
    /**
     * Faint background watermark behind the card content, centred horizontally and dropped a
     * little below the card's vertical centre.
     *
     * - A **string** is an emoji/text watermark (e.g. `'🏆'`), drawn oversized via a pseudo-element.
     * - A **`ReactNode`** (e.g. a `DrawerMark`) is rendered in a faint art layer; the card
     *   root becomes a `mrs-reveal-host`, so a hover-reveal mark dropped here opens on card hover.
     *
     * Ignored when `variant` is set — the variant always shows `⚠️`.
     */
    watermark?: ReactNode;
    /**
     * For a **`ReactNode`** watermark only (ignored for a string/variant watermark): scales the
     * node's intrinsic `<svg>` / `<img>` / `<span>` size up to watermark scale, oversized and faint,
     * mirroring the string-emoji watermark — the right behavior for a small icon-kit glyph: a lucide
     * `<svg>`, an emoji drawn as a bundled `<img>` asset, or a native-char span (e.g. `<AppIcon>`).
     *
     * Set `false` for a self-sized illustration (e.g. `DrawerMark`) that already lays itself out
     * at watermark scale and shouldn't be force-scaled. Default `true`.
     */
    autoscaleWatermark?: boolean;
    size?: ContentCardSize;
    /**
     * Proportion of the card. Default `'standard'` (`height = width / φ`); `'landscape'` is the
     * shorter-wider `height = width / φ²` — for light cards (no footer, small content) where the
     * standard height reads too tall.
     */
    shape?: ContentCardShape;
    onClick?: () => void;
    hoverable?: boolean;
    /**
     * Shows the built-in right-edge vertically-centred grip handle. Pair with
     * `dragHandleProps` to wire your DND library.
     */
    showDragHandle?: boolean;
    /**
     * A custom drag handle node, rendered in place of the built-in grip (implies a
     * visible handle, so `showDragHandle` isn't also needed). Wire it with `dragHandleProps`.
     */
    dragHandle?: ReactNode;
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
     * Interactive-root seam. The consumer renders its own router `<Link>` here, spreading the
     * supplied props, and the card mounts it as a **full-bleed block-link overlay** so the whole
     * tile is a real, keyboard-activatable anchor — while the card root stays a `<div>` that owns
     * its hover/border/focus states. The shell imports no router; `to`/`params` type-safety lives
     * at the call site:
     *
     * ```tsx
     * renderLink={(p) => <Link {...p} to="/doc/$id" params={{ id }} />}
     * ```
     *
     * Mutually exclusive with a drag handle.
     */
    renderLink?: (linkProps: ContentCardLinkProps) => ReactNode;
    className?: string;
    style?: CSSProperties;
}
export type ContentCardProps = (ContentCardBaseProps & {
    content: string;
    html?: boolean;
    children?: never;
}) | (ContentCardBaseProps & {
    content?: never;
    html?: never;
    children: ReactNode;
}) | (ContentCardBaseProps & {
    icon: ContentCardIconConfig;
    content?: never;
    html?: never;
    children?: never;
});
export declare const ContentCard: import("react").ForwardRefExoticComponent<ContentCardProps & import("react").RefAttributes<HTMLDivElement>>;
