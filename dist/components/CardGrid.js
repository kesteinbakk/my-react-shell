import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from './cn';
/**
 * A static grid of fixed-size cards: they flow left-to-right and wrap when a row
 * is full, separated by a fixed `gap`. Cards are **not** stretched, so a larger
 * gap may remain at the end of a row, and every card keeps its own intrinsic
 * width/height (e.g. {@link StatCard}, {@link ContentCard}, {@link PhiCard}).
 *
 * For fluid cards that stretch to fill uniform columns, use {@link DynamicCardGrid}.
 */
export const CardGrid = forwardRef(function CardGrid({ align = 'start', gap, className, style, children, ...props }, ref) {
    const cssVars = gap != null
        ? { '--mrs-card-grid-gap': gap, ...style }
        : style;
    return (_jsx("div", { ref: ref, className: cn('mrs-card-grid', align === 'center' && 'mrs-card-grid--center', className), style: cssVars, ...props, children: children }));
});
