import type { HTMLAttributes, ReactNode } from 'react';
/**
 * A rung of the semantic surface ladder — addressed by ROLE, not by how light or
 * dark it looks in one palette. The direction holds in both modes: `raised` reads
 * lifted above the card, `sunken` / `sunken-deep` read recessed below it, and the
 * `background*` rungs are the page canvas everything sits on. See the theme guide →
 * "The surface ladder" for the full mapping.
 */
export type SurfaceLevel = 'raised' | 'primary' | 'sunken' | 'sunken-deep' | 'background' | 'background-secondary';
/** Structural style: a painted `filled` panel, or a transparent `outline` box. */
export type SurfaceVariant = 'filled' | 'outline';
/** Optional cast/ambient elevation, tracking palette + mode via `--color-shadow-*`. */
export type SurfaceElevation = 'none' | 'card' | 'popover';
/** Corner rounding. `md` (0.5rem) matches `Card` / `InfoBox`. */
export type SurfaceRadius = 'none' | 'sm' | 'md' | 'lg';
export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
    /** Which ladder rung to paint. Defaults to `primary` (the card plane). */
    level?: SurfaceLevel;
    /** `filled` (painted, default) or `outline` (transparent + border). */
    variant?: SurfaceVariant;
    /**
     * Hairline border. Defaults to `true` for `outline` (it reads by its border) and
     * `false` for `filled` (it reads by its fill) — pass explicitly to override either.
     */
    bordered?: boolean;
    /** Cast/ambient shadow. Defaults to `none`; use `card` for panels, `popover` for floating chrome. */
    elevation?: SurfaceElevation;
    /** Corner rounding. Defaults to `md`. */
    radius?: SurfaceRadius;
    children?: ReactNode;
}
/**
 * The neutral, role-parameterized surface primitive: a themed `<div>` painted on any
 * rung of the semantic surface ladder, so you never hand-pick a `--color-surface-*`
 * token on a bare element. It owns everything theme-token-coupled — the fill, the
 * border, the elevation, and the paired foreground `color` (so nested text can't wash
 * out) — and leaves layout (padding, gap, flow) to your own `className`.
 *
 * Reach for `Surface` when you need a themed region that isn't a `Card` — a recessed
 * well, a raised side panel, a banded section — and for a full card use `Card`, which
 * is `Surface level="primary"` with the kit's card chrome baked in.
 *
 * ```tsx
 * <Surface level="sunken" className="p-4">A recessed well.</Surface>
 * <Surface level="raised" elevation="popover" className="p-3">Floating panel.</Surface>
 * <Surface variant="outline" className="p-4">Outline-only box on the canvas.</Surface>
 * ```
 */
export declare function Surface({ level, variant, bordered, elevation, radius, className, children, ...rest }: SurfaceProps): import("react").JSX.Element;
