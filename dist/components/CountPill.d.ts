import type { ComponentPropsWithoutRef } from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const countPillVariants: (props?: ({
    tone?: "primary" | "info" | "success" | "warning" | "danger" | "secondary" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type CountPillTone = NonNullable<VariantProps<typeof countPillVariants>['tone']>;
export interface CountPillProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
    /** The numeric count to display. */
    count: number;
    /** Solid color tone. Defaults to `primary`. */
    tone?: CountPillTone;
    /** Clamp the display above this value, rendering `${max}+`. Defaults to `99`. */
    max?: number;
}
/**
 * A small, solid-fill numeric count pill — unread counts, tab/section counts, a
 * notification-bell overlay. Renders `${max}+` once `count` exceeds `max`
 * (default `99`); the caller decides when to show it (e.g. only when `count >
 * 0`) and where to place it (an absolute overlay is the caller's `className`).
 *
 * Forwards any standard `<span>` attribute (`title`, `aria-label`, `data-*`,
 * event handlers, …) to the root.
 */
export declare function CountPill({ count, tone, max, className, ...rest }: CountPillProps): import("react").JSX.Element;
export {};
