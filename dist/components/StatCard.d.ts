import type { ReactNode } from 'react';
import type { AccentPlacement } from './accent';
import type { Tone } from './tone';
import type { PhiCardFooter, PhiCardFooterLine, PhiCardFooterLineType, PhiCardSize } from './PhiCard';
export type { PhiCardFooter as StatCardFooter, PhiCardFooterLine as StatCardFooterLine, PhiCardFooterLineType as StatCardFooterLineType };
/** Semantic accent hue — the kit's canonical {@link Tone}, shared with `PhiCard`. */
export type StatCardTone = Tone;
/** Structural alert variant — overrides `tone` to the same value and forces the ⚠️ watermark. */
export type StatCardVariant = 'warning' | 'danger';
export interface StatCardBadge {
    /** Primary value shown in the badge circle. */
    value: number | string;
    /** Short uppercase label below the value. Omit when `max` is present. */
    label?: string;
    /**
     * When given: renders an SVG arc-ring showing `value / max` progress.
     * The `label` prop is ignored in arc mode.
     */
    max?: number;
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
    /** Circle badge in the top-right corner. */
    badge?: StatCardBadge;
    /**
     * Semantic tone — drives the accent stripe color and badge tint.
     * Ignored when `color` is set.
     */
    tone?: StatCardTone;
    /** Raw CSS color string for the accent stripe and badge; overrides `tone`. */
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
     * When `true`, the whole accent — top stripe, badge tint, and stat numbers —
     * takes the **gauge's** completeness color (red → amber → green) instead of
     * `tone`/`color`, so the card reads as one coherent color, and the stripe is
     * forced to the top edge.
     *
     * Bound to `sideBarCompleteness`: the top stripe renders only when a gauge is
     * present — `sideBarCompleteness === undefined` → **no top stripe** (badge and
     * stat numbers fall back to `tone`/`color`). Throws in dev if combined with
     * `accentPlacement='left'`. Default `false`.
     */
    topStripeFollowsGauge?: boolean;
    /**
     * Data stat items displayed below the header.
     * Each item has a `value` with either a `label` OR a `max` — not both (throws in dev).
     * Suppressed (not rendered) when `body` is set.
     */
    stats?: StatItem[];
    /**
     * Freeform center slot — sits between the header and `lower`/`footer`, vertically
     * centered. When set, `stats` are not rendered.
     */
    body?: ReactNode;
    /**
     * Structural variant — overrides `tone` to the same value (so the accent stripe,
     * badge tint, and body text all reflect the variant hue) and forces `⚠️` as the
     * watermark background emoji, ignoring the `watermark` prop.
     */
    variant?: StatCardVariant;
    /**
     * Structured footer (same shape as PhiCard): meta lines on the left, badges on the right.
     * Throws in dev if given alongside `lower`.
     */
    footer?: PhiCardFooter;
    /**
     * Freeform footer node — e.g. a CTA pill.
     * Throws in dev if given alongside `footer`.
     */
    lower?: ReactNode;
    /**
     * Emoji or text rendered as a faint background watermark. E.g. `'🏆'`.
     * Ignored when `variant` is set — the variant always shows `⚠️`.
     */
    watermark?: string;
    /** Size preset — same widths as `PhiCard`. Default: `'md'`. */
    size?: PhiCardSize;
    /** Click handler; makes the whole card interactive. */
    onClick?: () => void;
    /** Hover lift effect. Defaults to `true` when `onClick` is set. */
    hoverable?: boolean;
    /** Extra classes on the outer card element. */
    className?: string;
}
/**
 * Stat card — a φ-framed KPI/status card with a title, an optional accent
 * badge circle (plain number or arc-ring progress), a row of data stats, and an
 * optional footer or freeform lower slot. Shares the same size system as PhiCard.
 *
 * The accent stripe, badge tint, and watermark are driven by `tone` (mapped to
 * semantic tokens) or overridden with a raw CSS `color` string.
 */
export declare function StatCard({ title, subtitle, badge, tone, color, accentPlacement, sideBarCompleteness, topStripeFollowsGauge, stats, body, variant, footer, lower, watermark, size, onClick, hoverable, className, }: StatCardProps): import("react").JSX.Element;
