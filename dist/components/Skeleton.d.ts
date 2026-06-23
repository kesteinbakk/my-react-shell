import type { HTMLAttributes } from 'react';
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
}
/**
 * Un-opinionated loading placeholder: a pulsing block that animates between the two
 * sunken surface tokens. Set its size with `style` / `className` (the block has no
 * intrinsic dimensions). Decorative — keep `aria-hidden` and convey loading state to
 * assistive tech elsewhere (e.g. a `Spinner` with a label or `aria-busy` on the
 * region).
 *
 * ```tsx
 * <Skeleton style={{ width: '12rem', height: '1rem' }} />
 * <Skeleton style={{ width: 48, height: 48, borderRadius: '50%' }} />
 * ```
 */
export declare function Skeleton({ className, ...rest }: SkeletonProps): import("react").JSX.Element;
