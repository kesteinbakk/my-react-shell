import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from './cn';
import { PHI } from './PhiCard';
export const GRID_CARD_MIN_WIDTH = {
    sm: 180,
    md: 240,
    lg: 400,
};
export const GRID_CARD_MAX_WIDTH = {
    sm: 210,
    md: 320,
    lg: 500,
};
/**
 * A structural card establishing the Phi golden ratio and size boundaries.
 * Accepts optional named slots (title, subtitle, footer) while preserving children for main body.
 */
export const GridCard = forwardRef(function GridCard({ size, variant = 'standard', title, subtitle, className, style, children, ...props }, ref) {
    const minWidth = size ? GRID_CARD_MIN_WIDTH[size] : undefined;
    const maxWidth = size ? GRID_CARD_MAX_WIDTH[size] : undefined;
    const aspectRatio = variant === 'landscape' ? `${PHI * PHI} / 1` : `${PHI} / 1`;
    const hasHeader = title != null || subtitle != null;
    const cssVars = {
        '--mrs-grid-card-aspect-ratio': aspectRatio,
        ...style,
    };
    if (minWidth)
        cssVars['--mrs-grid-card-min-width'] = `${minWidth}px`;
    if (maxWidth)
        cssVars['--mrs-grid-card-max-width'] = `${maxWidth}px`;
    return (_jsxs("div", { ref: ref, className: cn('mrs-grid-card', className), style: cssVars, ...props, children: [hasHeader ? (_jsxs("div", { className: "mrs-grid-card__header", children: [title ? _jsx("div", { className: "mrs-grid-card__title", children: title }) : null, subtitle ? _jsx("div", { className: "mrs-grid-card__subtitle", children: subtitle }) : null] })) : null, _jsx("div", { className: "mrs-grid-card__body", children: children })] }));
});
