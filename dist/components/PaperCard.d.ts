import { type CSSProperties, type ReactNode } from 'react';
import type { AccentPlacement } from './accent';
import type { Tone } from './tone';
import { type CardIconPlacement, type CardIconConfig } from './card-icon';
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
/** Where a `PaperCard` `icon` renders — see {@link CardIconPlacement}. */
export type PaperCardIconPlacement = CardIconPlacement;
/** The `{ content, placement }` object form of `icon` — see {@link PaperCardIconPlacement}. */
export type PaperCardIconConfig = CardIconConfig;
export interface PaperCardProps {
    /** Card title. */
    title: string;
    /** Optional subtitle / meta line shown below the title. */
    subtitle?: string;
    /**
     * Icon/emoji glyph. A bare `ReactNode` is shorthand for `{ content, placement: 'title' }`
     * (rendered inline beside the title block). Pass the full `{ content, placement }` form to
     * place it in a corner (never affects layout) or `'center'` (replaces the `content`/`image`
     * body) — see {@link PaperCardIconPlacement}.
     *
     * `'upperRight'` clears the dog-eared fold (it reuses the `corner` slot's top offset) but
     * collides with the `corner` slot itself — combining icon `'upperRight'` with `corner` throws
     * in dev. `'center'` can't combine with `content` or `image` (both own the body) — throws in dev.
     */
    icon?: ReactNode | PaperCardIconConfig;
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
    /**
     * Top-corner action slot (e.g. a `DropdownMenu` trigger). Rendered as a direct sibling
     * of the link overlay — **above** it (`z-index`) — so it stays independently clickable when
     * `renderLink` is set. Positioned just below the fold triangle to preserve the dog-ear.
     */
    corner?: ReactNode;
    /**
     * Faint background watermark. A **`string`** is an oversized emoji/text drawn via the
     * sheet's CSS `::after` (e.g. `'📄'`); a **`ReactNode`** (e.g. an `<AppIcon>` / `<img>`)
     * renders in an art layer behind the content. Same shape as `StatCard`/`ContentCard`/
     * `DynamicCard`.
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
     * A real, full-opacity preview layer filling the sheet behind the title/footer — e.g. a
     * rendered PDF first page (`<canvas>`/`<img>`). Unlike `watermark` (a faint decorative
     * background glyph), `image` is the card's actual visible content, so the title/subtitle and
     * footer render over it on a translucent scrim for legibility.
     */
    image?: ReactNode;
    /** Size preset — fixed-width A4-portrait card. Default: `'md'` (≈168px). */
    size?: PaperCardSize;
    /** Click handler; makes the whole card interactive. */
    onClick?: () => void;
    /** Hover lift effect. Defaults to `true` when `onClick` is set. */
    hoverable?: boolean;
    /**
     * Shows the built-in top-centre grip handle. Pair with `dragHandleProps` to wire your DND library.
     */
    showDragHandle?: boolean;
    /**
     * A custom drag handle node, rendered in place of the built-in grip (implies a
     * visible handle, so `showDragHandle` isn't also needed). Wire it with `dragHandleProps`.
     */
    dragHandle?: ReactNode;
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
     * Mutually exclusive with a drag handle.
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
