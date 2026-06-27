import { type ReactNode } from 'react';
export interface AccordionItem {
    /** Stable identifier used to track which panels are open. */
    value: string;
    /** The always-visible header content. */
    trigger: ReactNode;
    /** The content revealed when this item is expanded. */
    content: ReactNode;
    /** Disable this item's trigger. */
    disabled?: boolean;
    /** Actions rendered before the trigger label. Interacting with them won't toggle the accordion. */
    actionsStart?: ReactNode;
    /** Actions rendered before the chevron. Interacting with them won't toggle the accordion. */
    actionsEnd?: ReactNode;
}
export type AccordionVariant = 'default' | 'bordered' | 'separated';
export type AccordionSize = 'sm' | 'md' | 'lg';
export interface AccordionProps {
    /** The panels, in display order. */
    items: AccordionItem[];
    /**
     * `single` — one panel open at a time (opening one closes the rest).
     * `multiple` — panels open independently. Defaults to `single`.
     */
    type?: 'single' | 'multiple';
    /**
     * For `type="single"`, allow collapsing the open panel so none is open.
     * Ignored for `type="multiple"`. Defaults to `true`.
     */
    collapsible?: boolean;
    /**
     * Controlled open value(s): a `string` for `type="single"`, a `string[]` for
     * `type="multiple"`.
     */
    value?: string | string[];
    /** Uncontrolled initial open value(s) — same shape as `value`. */
    defaultValue?: string | string[];
    /** Fired when the open set changes — receives the same shape as `value`. */
    onValueChange?: (value: string | string[]) => void;
    /** Item surface treatment. Defaults to `default`. */
    variant?: AccordionVariant;
    /** Trigger padding + type scale. Defaults to `md`. */
    size?: AccordionSize;
    /** Render the rotating chevron on each item. Defaults to `true`. */
    showArrow?: boolean;
    /** Expand/collapse animation duration in milliseconds. Defaults to `200`. */
    animationDuration?: number;
    /** Extra classes merged onto the root. */
    className?: string;
}
/**
 * A vertical set of disclosures with group behavior, on Radix Accordion: roving
 * arrow-key focus between headers, single (one-open-at-a-time) or multiple-open
 * mode, and the `--radix-accordion-content-height` var each panel's height
 * animation reads. Data-driven via `items`; the open set is controlled
 * (`value` / `onValueChange`) or uncontrolled (`defaultValue`). For a lone
 * trigger+region, use `Collapsible` instead.
 */
export declare function Accordion({ items, type, collapsible, value, defaultValue, onValueChange, variant, size, showArrow, animationDuration, className, }: AccordionProps): import("react").JSX.Element;
