import type { ReactNode } from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const badgeVariants: (props?: ({
    tone?: "neutral" | "success" | "warning" | "danger" | "info" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;
export interface BadgeProps {
    /** Semantic tone. Defaults to `neutral`. */
    tone?: BadgeTone;
    /** Show a leading status dot. */
    dot?: boolean;
    children?: ReactNode;
    className?: string;
}
/** Compact status / category badge on the semantic tint + `-strong` tokens. */
export declare function Badge({ tone, dot, children, className }: BadgeProps): import("react").JSX.Element;
export {};
