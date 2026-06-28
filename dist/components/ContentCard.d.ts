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
export type ContentCardTone = Tone;
export type ContentCardVariant = 'warning' | 'danger';
export interface ContentCardProps {
    title: string;
    subtitle?: string;
    content: string;
    html?: boolean;
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
    footer?: ContentCardFooter;
    lower?: ReactNode;
    watermark?: string;
    size?: ContentCardSize;
    onClick?: () => void;
    hoverable?: boolean;
    dragHandle?: boolean | ReactNode;
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
    className?: string;
    style?: CSSProperties;
}
export declare const ContentCard: import("react").ForwardRefExoticComponent<ContentCardProps & import("react").RefAttributes<HTMLDivElement>>;
