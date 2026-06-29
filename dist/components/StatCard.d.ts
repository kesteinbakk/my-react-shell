import { type CSSProperties, type ReactNode } from 'react';
import type { AccentPlacement } from './accent';
import type { Tone } from './tone';
/**
 * Size preset — a fixed-width golden-ratio card (`height = width / φ`). `md` (≈312px,
 * four to a `wide` 1440px row) is the default. Self-contained — no longer derived from `PhiCard`.
 */
export type StatCardSize = 'sm' | 'md' | 'lg' | 'xl';
/** Leading glyph kind for a footer meta line. */
export type StatCardFooterLineType = 'date' | 'time' | 'check';
/** One left-side footer line: text with an optional kit-shipped leading glyph. */
export interface StatCardFooterLine {
    text: ReactNode;
    type?: StatCardFooterLineType;
}
/** Structured footer: meta lines on the left, badges stacked on the right. */
export interface StatCardFooter {
    lines?: StatCardFooterLine[];
    badges?: ReactNode[];
}
/** Proportion of the card: `'standard'` is φ:1 (`height = width / φ`); `'landscape'` is the shorter-wider φ²:1 (`height = width / φ²`). */
export type StatCardShape = 'standard' | 'landscape';
/**
 * Props the card hands the consumer's {@link StatCardProps.renderLink} callback to spread onto
 * its router `<Link>`. The card supplies the overlay `className` and an auto-wired
 * `aria-labelledby` pointing at the card's title; the consumer adds `to`/`params`.
 */
export interface StatCardLinkProps {
    className: string;
    'aria-labelledby'?: string;
}
/** Semantic accent hue — the kit's canonical {@link Tone}, shared with `PhiCard`. */
export type StatCardTone = Tone;
/** Structural alert variant — overrides `tone` to the same value and forces the ⚠️ watermark. */
export type StatCardVariant = 'warning' | 'danger';
export interface StatCardMedallion {
    /** Primary value shown in the medallion circle. */
    value: number | string;
    /** Short uppercase label below the value. Omit when `max` is present. */
    label?: string;
    /**
     * When given: renders an SVG arc-ring showing `value / max` progress.
     * The `label` prop is ignored in arc mode.
     */
    max?: number;
    /**
     * Size of the medallion. `'lg'` is the standard size. `'sm'` is a smaller
     * footprint with no label, a smaller font, and value clamped to 99.
     * Default: `'lg'`.
     */
    size?: 'lg' | 'sm';
}
export interface StatItem {
    value: number | string;
    /**
     * Label shown above the number.
     * **Cannot be combined with `max`** — throws in dev.
     */
    label?: string;
    /**
     * When given: renders the item as a compact arc-ring.
     * **Cannot be combined with `label`** — throws in dev.
     */
    max?: number;
}
export interface StatCardProps {
    /** Card title. */
    title: string;
    /** Optional subtitle shown below the title. */
    subtitle?: string;
    /** Circle medallion in the top-right corner. */
    medallion?: StatCardMedallion;
    /**
     * Semantic tone — drives the accent stripe color and medallion tint.
     * Ignored when `color` is set.
     */
    tone?: StatCardTone;
    /** Raw CSS color string for the accent stripe and medallion; overrides `tone`. */
    color?: string;
    /** Where the accent reads: a `'top'` stripe (default) or a `'left'` bar. */
    accentPlacement?: AccentPlacement;
    /**
     * Left-edge completion gauge — a vertical bar whose colored fill rises from the
     * bottom to `value × height`, interpolating **red → amber → green**
     * (`danger → warning → success` tokens) as it climbs. A `0`–`1` fraction
     * (clamped). Independent of `accentPlacement`, so a top accent stripe and this
     * side gauge can read at once.
     *
     * **Checked, not defaulted:** `undefined` renders no gauge; `0` renders the gauge
     * (faint track, empty fill).
     *
     * Combining with `accentPlacement='left'` throws in dev (both occupy the left
     * edge); in production the gauge takes precedence and the left accent stripe is
     * suppressed, so they never overlap.
     */
    sideBarCompleteness?: number;
    /**
     * When `true`, the whole accent — top stripe, medallion tint, and stat numbers —
     * takes the **gauge's** completeness color (red → amber → green) instead of
     * `tone`/`color`, so the card reads as one coherent color, and the stripe is
     * forced to the top edge.
     *
     * Bound to `sideBarCompleteness`: the top stripe renders only when a gauge is
     * present — `sideBarCompleteness === undefined` → **no top stripe** (medallion and
     * stat numbers fall back to `tone`/`color`). Throws in dev if combined with
     * `accentPlacement='left'`. Default `false`.
     */
    topStripeFollowsGauge?: boolean;
    /**
     * Data stat items displayed below the header.
     * Each item has a `value` with either a `label` OR a `max` — not both (throws in dev).
     */
    stats?: StatItem[];
    /**
     * Structural variant — overrides `tone` to the same value (so the accent stripe,
     * badge tint, and body text all reflect the variant hue) and forces `⚠️` as the
     * watermark background emoji, ignoring the `watermark` prop.
     */
    variant?: StatCardVariant;
    /**
     * Footer slot: either a freeform `ReactNode` (e.g. a CTA pill) or a structured
     * `{ lines, badges }` (meta lines on the left, badges on the right).
     */
    footer?: ReactNode | StatCardFooter;
    /**
     * Faint background watermark behind the card content, centred horizontally and vertically.
     *
     * - A **string** is an emoji/text watermark (e.g. `'🏆'`), drawn oversized via a pseudo-element.
     * - A **`ReactNode`** (e.g. a `DrawerMark`) is rendered in a faint art layer; the card
     *   root becomes a `mrs-reveal-host`, so a hover-reveal mark dropped here opens on card hover.
     *
     * Ignored when `variant` is set — the variant always shows `⚠️`.
     */
    watermark?: ReactNode;
    /**
     * How a **ReactNode** `watermark` is laid out (ignored for a string/variant watermark):
     *
     * - `'art'` (default) — the existing self-sized illustration layer (e.g. a `DrawerMark`):
     *   centred horizontally, dropped a little below centre, scaled to the card.
     * - `'glyph'` — a keyed icon glyph (e.g. a lucide `<svg>` / emoji span from a consumer icon
     *   kit) scaled and positioned to **mirror the string-emoji watermark**: oversized, faint,
     *   centred, without tilt. Use this when the watermark is a single icon rather than an
     *   illustration, so it reads at the same size as the `string` emoji watermark.
     */
    watermarkMode?: 'art' | 'glyph';
    /** Size preset — fixed-width golden-ratio card. Default: `'md'` (≈312px). */
    size?: StatCardSize;
    /**
     * Proportion of the card. Default `'standard'` (`height = width / φ`); `'landscape'` is the
     * shorter-wider `height = width / φ²` — for light cards (no footer, small content) where the
     * standard height reads too tall. A full stats row + footer can overflow the shorter box.
     */
    shape?: StatCardShape;
    /** Click handler; makes the whole card interactive. */
    onClick?: () => void;
    /** Hover lift effect. Defaults to `true` when `onClick` is set. */
    hoverable?: boolean;
    /** Click handler for the medallion. */
    onMedallionPress?: () => void;
    /**
     * Enables the drag handler. If `true`, renders a built-in right-edge vertically-centered grip handle.
     * If a `ReactNode`, renders your custom handle.
     */
    dragHandle?: boolean | ReactNode;
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
     * Interactive-root seam. The consumer renders its own router `<Link>` here, spreading the
     * supplied props, and the card mounts it as a **full-bleed block-link overlay** so the whole
     * tile is a real, keyboard-activatable anchor — while the card root stays a `<div>` that owns
     * its hover/border/focus states. Nested controls (the medallion button, drag handle) stay
     * clickable above the overlay. The shell imports no router; `to`/`params` type-safety lives
     * at the call site:
     *
     * ```tsx
     * renderLink={(p) => <Link {...p} to="/entity/$id" params={{ id }} />}
     * ```
     *
     * Mutually exclusive with `dragHandle` (a nav tile isn't drag-reorderable) — throws in dev.
     */
    renderLink?: (linkProps: StatCardLinkProps) => ReactNode;
    /** Extra classes on the outer card element. */
    className?: string;
    /** Optional style override. */
    style?: CSSProperties;
}
/**
 * Stat card — a φ-framed KPI/status card with a title, an optional accent
 * medallion circle (plain number or arc-ring progress), a row of data stats, and an
 * optional footer or freeform lower slot.
 *
 * The accent stripe, medallion tint, and watermark are driven by `tone` (mapped to
 * semantic tokens) or overridden with a raw CSS `color` string.
 */
export declare const StatCard: import("react").ForwardRefExoticComponent<StatCardProps & import("react").RefAttributes<HTMLDivElement>>;
