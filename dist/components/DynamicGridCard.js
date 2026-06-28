import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from './cn';
/** φ — the golden ratio. The dynamic card's shape is `aspect-ratio: φ : 1` (or `φ² : 1` for landscape). */
const PHI = 1.6180339887;
export const DYNAMIC_GRID_CARD_MIN_WIDTH = {
    sm: 180,
    md: 240,
    lg: 400,
};
export const DYNAMIC_GRID_CARD_MAX_WIDTH = {
    sm: 210,
    md: 320,
    lg: 500,
};
/**
 * Fluid card for the {@link DynamicCardGrid}: it stretches to `width: 100%` of its
 * grid column and inherits the grid's max-width cap, keeping the golden-ratio shape via
 * `aspect-ratio`. Accepts optional named slots (`title`, `subtitle`) with the primary
 * content passed as `children`.
 */
export const DynamicGridCard = forwardRef(function DynamicGridCard({ size, variant = 'standard', title, subtitle, className, style, children, ...props }, ref) {
    const minWidth = size ? DYNAMIC_GRID_CARD_MIN_WIDTH[size] : undefined;
    const maxWidth = size ? DYNAMIC_GRID_CARD_MAX_WIDTH[size] : undefined;
    const aspectRatio = variant === 'landscape' ? `${PHI * PHI} / 1` : `${PHI} / 1`;
    const hasHeader = title != null || subtitle != null;
    const cssVars = {
        '--mrs-dynamic-grid-card-aspect-ratio': aspectRatio,
        ...(minWidth != null ? { '--mrs-dynamic-grid-card-min-width': `${minWidth}px` } : {}),
        ...(maxWidth != null ? { '--mrs-dynamic-grid-card-max-width': `${maxWidth}px` } : {}),
        ...style,
    };
    return (_jsxs("div", { ref: ref, className: cn('mrs-dynamic-grid-card', className), style: cssVars, ...props, children: [hasHeader ? (_jsxs("div", { className: "mrs-dynamic-grid-card__header", children: [title ? _jsx("div", { className: "mrs-dynamic-grid-card__title", children: title }) : null, subtitle ? _jsx("div", { className: "mrs-dynamic-grid-card__subtitle", children: subtitle }) : null] })) : null, _jsx("div", { className: "mrs-dynamic-grid-card__body", children: children })] }));
});
