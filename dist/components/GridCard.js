import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from './cn';
import { PHI } from './PhiCard';
const SIZE_MIN_WIDTH = {
    sm: 180,
    md: 240,
    lg: 320,
    xl: 480,
};
const SIZE_MAX_WIDTH = {
    sm: 240,
    md: 320,
    lg: 480,
    xl: 720,
};
/**
 * A structural card establishing the Phi golden ratio and size boundaries.
 * Accepts optional named slots (title, subtitle, footer) while preserving children for main body.
 */
export const GridCard = forwardRef(function GridCard({ size = 'md', variant = 'standard', title, subtitle, footer, className, style, children, ...props }, ref) {
    const minWidth = SIZE_MIN_WIDTH[size];
    const maxWidth = SIZE_MAX_WIDTH[size];
    const aspectRatio = variant === 'landscape' ? `${PHI * PHI} / 1` : `${PHI} / 1`;
    const hasHeader = title != null || subtitle != null;
    const hasFooter = footer != null;
    return (_jsxs("div", { ref: ref, className: cn('mrs-grid-card', className), style: {
            '--mrs-grid-card-min-width': `${minWidth}px`,
            '--mrs-grid-card-max-width': `${maxWidth}px`,
            '--mrs-grid-card-aspect-ratio': aspectRatio,
            ...style,
        }, ...props, children: [hasHeader ? (_jsxs("div", { className: "mrs-grid-card__header", children: [title ? _jsx("div", { className: "mrs-grid-card__title", children: title }) : null, subtitle ? _jsx("div", { className: "mrs-grid-card__subtitle", children: subtitle }) : null] })) : null, _jsx("div", { className: "mrs-grid-card__body", children: children }), hasFooter ? (_jsx("div", { className: "mrs-grid-card__footer", children: footer })) : null] }));
});
