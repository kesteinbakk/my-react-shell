import type { ReactNode } from 'react';
import type { Tone } from './tone';
export type BadgeTone = Tone;
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
