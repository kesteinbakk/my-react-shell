import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import * as RadixCollapsible from '@radix-ui/react-collapsible';
import { cva } from 'class-variance-authority';
import { cn } from './cn';
const triggerVariants = cva('mrs-collapsible__trigger', {
    variants: {
        variant: {
            default: 'mrs-collapsible__trigger--default',
            bordered: 'mrs-collapsible__trigger--bordered',
            ghost: 'mrs-collapsible__trigger--ghost',
            filled: 'mrs-collapsible__trigger--filled',
        },
        size: {
            sm: 'mrs-collapsible__trigger--sm',
            md: 'mrs-collapsible__trigger--md',
            lg: 'mrs-collapsible__trigger--lg',
        },
        layout: {
            // Chevron pushed to the right edge (the default) vs. sitting directly after
            // the trigger content.
            spread: 'mrs-collapsible__trigger--spread',
            inline: 'mrs-collapsible__trigger--inline',
        },
    },
    defaultVariants: { variant: 'default', size: 'md', layout: 'spread' },
});
const chevronDown = (_jsx("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "m6 9 6 6 6-6" }) }));
/**
 * A single disclosure: a trigger that toggles one collapsible region, on Radix
 * Collapsible (open-state management, `aria-expanded`/`aria-controls`, the
 * `--radix-collapsible-content-height` var the height animation reads). Works
 * controlled (`expanded` / `onExpandedChange`) or uncontrolled (`defaultExpanded`).
 * For a set of disclosures with one-open-at-a-time / roving-focus behavior, use
 * `Accordion` instead.
 */
export function Collapsible({ expanded, defaultExpanded = false, onExpandedChange, trigger, renderTrigger, children, actionsStart, actionsEnd, showArrow = true, animationDuration = 200, disabled, variant, size, inlineChevron = false, className, triggerClassName, contentClassName, arrowClassName, }) {
    const [internalOpen, setInternalOpen] = useState(defaultExpanded);
    const isControlled = expanded !== undefined;
    const open = isControlled ? expanded : internalOpen;
    const handleOpenChange = (next) => {
        if (!isControlled)
            setInternalOpen(next);
        onExpandedChange?.(next);
    };
    const contentStyle = {
        '--mrs-collapsible-duration': `${animationDuration}ms`,
    };
    return (_jsxs(RadixCollapsible.Root, { open: open, onOpenChange: handleOpenChange, disabled: disabled, className: cn('mrs-collapsible', className), children: [_jsxs(RadixCollapsible.Trigger, { className: cn(triggerVariants({ variant, size, layout: inlineChevron ? 'inline' : 'spread' }), triggerClassName), children: [_jsxs("div", { className: "mrs-collapsible__trigger-main", children: [actionsStart && (_jsx("div", { className: "mrs-collapsible__actions", onClick: (e) => e.stopPropagation(), onPointerDown: (e) => e.stopPropagation(), children: actionsStart })), _jsx("span", { className: "mrs-collapsible__label", children: renderTrigger ? renderTrigger(open) : trigger })] }), (actionsEnd || showArrow) && (_jsxs("div", { className: "mrs-collapsible__trigger-end", children: [actionsEnd && (_jsx("div", { className: "mrs-collapsible__actions", onClick: (e) => e.stopPropagation(), onPointerDown: (e) => e.stopPropagation(), children: actionsEnd })), showArrow && (_jsx("span", { className: cn('mrs-collapsible__chevron', open && 'mrs-collapsible__chevron--open', arrowClassName), "aria-hidden": "true", children: chevronDown }))] }))] }), _jsx(RadixCollapsible.Content, { className: cn('mrs-collapsible__content', contentClassName), style: contentStyle, children: _jsx("div", { className: "mrs-collapsible__body", children: children }) })] }));
}
