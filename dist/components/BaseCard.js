import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from './cn';
import { PHI } from './PhiCard';
const SIZE_MIN_WIDTH = {
    sm: 180,
    md: 240,
    lg: 320,
};
const SIZE_MAX_WIDTH = {
    sm: 240,
    md: 320,
    lg: 480,
};
/**
 * A purely structural card establishing the Phi golden ratio and size boundaries,
 * without any opinionated content layout. It stretches fully within its min/max boundaries.
 */
export const BaseCard = forwardRef(function BaseCard({ size = 'md', className, style, children, ...props }, ref) {
    const minWidth = SIZE_MIN_WIDTH[size];
    const maxWidth = SIZE_MAX_WIDTH[size];
    return (_jsx("div", { ref: ref, className: cn('mrs-base-card', className), style: {
            ...style,
            '--mrs-base-card-min-width': `${minWidth}px`,
            '--mrs-base-card-max-width': `${maxWidth}px`,
            '--mrs-base-card-aspect-ratio': `${PHI} / 1`,
        }, ...props, children: children }));
});
