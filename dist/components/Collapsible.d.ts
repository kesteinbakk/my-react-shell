import { type ReactNode } from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const triggerVariants: (props?: ({
    variant?: "default" | "bordered" | "ghost" | "filled" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    layout?: "inline" | "spread" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type CollapsibleVariant = NonNullable<VariantProps<typeof triggerVariants>['variant']>;
export type CollapsibleSize = NonNullable<VariantProps<typeof triggerVariants>['size']>;
export interface CollapsibleProps {
    /** Controlled open state. Omit for an uncontrolled collapsible. */
    expanded?: boolean;
    /** Initial open state when uncontrolled. Defaults to `false`. */
    defaultExpanded?: boolean;
    /** Fired whenever the open state changes — in both controlled and uncontrolled mode. */
    onExpandedChange?: (expanded: boolean) => void;
    /** Static trigger content. */
    trigger?: ReactNode;
    /**
     * Trigger content as a function of the open state — use when the trigger must
     * itself reflect expansion. Takes precedence over `trigger`.
     */
    renderTrigger?: (expanded: boolean) => ReactNode;
    /** The content revealed when expanded. */
    children?: ReactNode;
    /** Render the rotating chevron. Defaults to `true`. */
    showArrow?: boolean;
    /** Expand/collapse animation duration in milliseconds. Defaults to `200`. */
    animationDuration?: number;
    /** Disable the trigger. */
    disabled?: boolean;
    /** Trigger surface treatment. Defaults to `default`. */
    variant?: CollapsibleVariant;
    /** Trigger padding + type scale. Defaults to `md`. */
    size?: CollapsibleSize;
    /**
     * Place the chevron directly after the trigger content (left-aligned) instead
     * of pushing it to the right edge. Defaults to `false`.
     */
    inlineChevron?: boolean;
    /** Extra classes merged onto the root. */
    className?: string;
    /** Extra classes merged onto the trigger button. */
    triggerClassName?: string;
    /** Extra classes merged onto the content region. */
    contentClassName?: string;
    /** Extra classes merged onto the chevron. */
    arrowClassName?: string;
}
/**
 * A single disclosure: a trigger that toggles one collapsible region, on Radix
 * Collapsible (open-state management, `aria-expanded`/`aria-controls`, the
 * `--radix-collapsible-content-height` var the height animation reads). Works
 * controlled (`expanded` / `onExpandedChange`) or uncontrolled (`defaultExpanded`).
 * For a set of disclosures with one-open-at-a-time / roving-focus behavior, use
 * `Accordion` instead.
 */
export declare function Collapsible({ expanded, defaultExpanded, onExpandedChange, trigger, renderTrigger, children, showArrow, animationDuration, disabled, variant, size, inlineChevron, className, triggerClassName, contentClassName, arrowClassName, }: CollapsibleProps): import("react").JSX.Element;
export {};
