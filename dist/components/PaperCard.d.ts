import { type CSSProperties, type ReactNode } from 'react';
import type { AccentPlacement } from './accent';
import type { Tone } from './tone';
/**
 * Size preset — a fixed-width A4-portrait card (`height = width × √2`). `md` (≈168px) is
 * the default: a small **preview / thumbnail** sheet, not a full page. `sm` is a smaller,
 * denser thumbnail; `lg` is literally A4's millimetre figures (210 × 297).
 */
export type PaperCardSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
/** Leading glyph kind for a footer meta line (shared shape with `StatCard`/`ContentCard`). */
export type PaperCardFooterLineType = 'date' | 'time' | 'check';
/** One left-side footer line: text with an optional kit-shipped leading glyph. */
export interface PaperCardFooterLine {
    text: ReactNode;
    type?: PaperCardFooterLineType;
}
/** Structured footer: meta lines on the left, badges stacked on the right. */
export interface PaperCardFooter {
    lines?: PaperCardFooterLine[];
    badges?: ReactNode[];
}
/**
 * Props the card hands the consumer's {@link PaperCardProps.renderLink} callback to spread onto
 * its router `<Link>`. The card supplies the overlay `className` and an auto-wired
 * `aria-labelledby` pointing at the card's title; the consumer adds `to`/`params`.
 */
export interface PaperCardLinkProps {
    className: string;
    'aria-labelledby'?: string;
}
export type PaperCardTone = Tone;
export interface PaperCardProps {
    /** Card title. */
    title: string;
    /** Optional subtitle / meta line shown below the title. */
    subtitle?: string;
    /** Freeform body text. Optional — a thumbnail can carry just a title. */
    content?: string;
    contentAlignX?: 'left' | 'center' | 'right';
    contentAlignY?: 'top' | 'center' | 'bottom';
    /** Clamp the body to N lines (CSS line-clamp). */
    maxLines?: number;
    /**
     * Semantic tone — drives an optional accent stripe. Default **none** (no accent): a
     * paper card reads from its proportion, fold, and shadow alone. The folded corner stays
     * a neutral surface tint even when an accent is set.
     */
    tone?: PaperCardTone;
    /** Raw CSS color string for the accent stripe; overrides `tone`. */
    color?: string;
    /** Where the accent reads when `tone`/`color` is set: a `'top'` stripe (default) or a `'left'` bar. */
    accentPlacement?: AccentPlacement;
    /**
     * Footer slot: either a freeform `ReactNode` or a structured `{ lines, badges }`
     * (meta lines on the left, badges on the right). Same shape as `StatCard`/`ContentCard`.
     */
    footer?: ReactNode | PaperCardFooter;
    /** Emoji or text rendered as a faint background watermark. E.g. `'📄'`. */
    watermark?: string;
    /** Size preset — fixed-width A4-portrait card. Default: `'md'` (≈168px). */
    size?: PaperCardSize;
    /** Click handler; makes the whole card interactive. */
    onClick?: () => void;
    /** Hover lift effect. Defaults to `true` when `onClick` is set. */
    hoverable?: boolean;
    /**
     * Enables the drag handler. If `true`, renders a built-in top-center grip handle.
     * If a `ReactNode`, renders your custom handle.
     */
    dragHandle?: boolean | ReactNode;
    /** Event listeners / attributes from your DND library, spread onto the drag handle. */
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
    renderLink?: (linkProps: PaperCardLinkProps) => ReactNode;
    className?: string;
    style?: CSSProperties;
}
/**
 * Paper card — a small **preview / thumbnail** card styled as a dog-eared sheet of paper at
 * A4 portrait proportions (`height = width × √2`). The folded top-right corner is genuinely
 * cut out of the sheet (`clip-path`) with a folded triangle sitting in the notch; the drop
 * shadow is carried on the wrapper via `filter: drop-shadow()` so it follows the dog-eared
 * silhouette rather than being clipped away.
 *
 * Optional `tone`/`color` adds an accent stripe (none by default). Shares the card-family
 * footer, watermark, hover-lift, drag-handle, and `renderLink` block-link seams.
 */
export declare const PaperCard: import("react").ForwardRefExoticComponent<PaperCardProps & import("react").RefAttributes<HTMLDivElement>>;
