import type { HTMLAttributes } from 'react';
export type SeparatorOrientation = 'horizontal' | 'vertical';
export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
    /** Layout direction. Defaults to `horizontal`. */
    orientation?: SeparatorOrientation;
}
/**
 * Un-opinionated divider line on `--color-border-primary`. A `role="separator"`
 * element with `aria-orientation`; a `horizontal` rule fills its container's width, a
 * `vertical` one fills its height (give the parent a height / use it in a flex row).
 *
 * ```tsx
 * <Separator />
 * <Separator orientation="vertical" />
 * ```
 */
export declare function Separator({ orientation, className, ...rest }: SeparatorProps): import("react").JSX.Element;
