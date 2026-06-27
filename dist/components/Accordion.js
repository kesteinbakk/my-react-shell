import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {} from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';
import { cn } from './cn';
const chevronDown = (_jsx("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "m6 9 6 6 6-6" }) }));
/**
 * A vertical set of disclosures with group behavior, on Radix Accordion: roving
 * arrow-key focus between headers, single (one-open-at-a-time) or multiple-open
 * mode, and the `--radix-accordion-content-height` var each panel's height
 * animation reads. Data-driven via `items`; the open set is controlled
 * (`value` / `onValueChange`) or uncontrolled (`defaultValue`). For a lone
 * trigger+region, use `Collapsible` instead.
 */
export function Accordion({ items, type = 'single', collapsible = true, value, defaultValue, onValueChange, variant = 'default', size = 'md', showArrow = true, animationDuration = 200, className, }) {
    const rootClassName = cn('mrs-accordion', `mrs-accordion--${variant}`, `mrs-accordion--${size}`, className);
    const rootStyle = {
        '--mrs-accordion-duration': `${animationDuration}ms`,
    };
    const renderedItems = items.map((item) => (_jsxs(RadixAccordion.Item, { value: item.value, disabled: item.disabled, className: "mrs-accordion__item", children: [_jsx(RadixAccordion.Header, { className: "mrs-accordion__header", children: _jsxs(RadixAccordion.Trigger, { className: "mrs-accordion__trigger", children: [_jsxs("div", { className: "mrs-accordion__trigger-main", children: [item.actionsStart && (_jsx("div", { className: "mrs-accordion__actions", onClick: (e) => e.stopPropagation(), onPointerDown: (e) => e.stopPropagation(), children: item.actionsStart })), _jsx("span", { className: "mrs-accordion__label", children: item.trigger })] }), (item.actionsEnd || showArrow) && (_jsxs("div", { className: "mrs-accordion__trigger-end", children: [item.actionsEnd && (_jsx("div", { className: "mrs-accordion__actions", onClick: (e) => e.stopPropagation(), onPointerDown: (e) => e.stopPropagation(), children: item.actionsEnd })), showArrow && (_jsx("span", { className: "mrs-accordion__chevron", "aria-hidden": "true", children: chevronDown }))] }))] }) }), _jsx(RadixAccordion.Content, { className: "mrs-accordion__content", children: _jsx("div", { className: "mrs-accordion__body", children: item.content }) })] }, item.value)));
    // Radix discriminates Root props on `type`, so the two modes render as distinct
    // elements. The unified `string | string[]` value/handler narrow cleanly into
    // each branch — a handler taking the wider union is assignable to Radix's
    // per-mode handler, and the value is narrowed by shape.
    if (type === 'multiple') {
        return (_jsx(RadixAccordion.Root, { type: "multiple", value: Array.isArray(value) ? value : undefined, defaultValue: Array.isArray(defaultValue) ? defaultValue : undefined, onValueChange: onValueChange, className: rootClassName, style: rootStyle, children: renderedItems }));
    }
    return (_jsx(RadixAccordion.Root, { type: "single", collapsible: collapsible, value: typeof value === 'string' ? value : undefined, defaultValue: typeof defaultValue === 'string' ? defaultValue : undefined, onValueChange: onValueChange, className: rootClassName, style: rootStyle, children: renderedItems }));
}
