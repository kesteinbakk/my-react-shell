import type { ComponentPropsWithoutRef } from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const badgeVariants: (props?: ({
    tone?: "neutral" | "success" | "warning" | "danger" | "info" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;
export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
    /** Semantic tone. Defaults to `neutral`. */
    tone?: BadgeTone;
    /** Show a leading status dot. */
    dot?: boolean;
}
/**
 * Compact status / category badge on the semantic tint + `-on-bg` tokens.
 *
 * Forwards any standard `<span>` attribute (`title`, `aria-*`, `data-*`, `id`,
 * event handlers, …) to the root, so a native tooltip or test id needs no
 * wrapper element.
 */
export declare function Badge({ tone, dot, children, className, ...rest }: BadgeProps): import("react").JSX.Element;
export {};
