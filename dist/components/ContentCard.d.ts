import { type CSSProperties, type ReactNode } from 'react';
import type { AccentPlacement } from './accent';
import type { Tone } from './tone';
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
export interface ContentCardBaseProps {
    title: string;
    subtitle?: string;
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
    watermark?: string;
    size?: ContentCardSize;
    /**
     * Proportion of the card. Default `'standard'` (`height = width / φ`); `'landscape'` is the
     * shorter-wider `height = width / φ²` — for light cards (no footer, small content) where the
     * standard height reads too tall.
     */
    shape?: ContentCardShape;
    onClick?: () => void;
    hoverable?: boolean;
    dragHandle?: boolean | ReactNode;
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
    /**
     * Accessible label for the drag handle. No default — pass a translated string (or supply
     * `aria-label` via `dragHandleProps`); absent → no label (the grip glyph stands alone).
     */
    dragHandleLabel?: string;
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
     * Mutually exclusive with `dragHandle` — throws in dev.
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
});
export declare const ContentCard: import("react").ForwardRefExoticComponent<ContentCardProps & import("react").RefAttributes<HTMLDivElement>>;
