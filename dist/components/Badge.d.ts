import type { ComponentPropsWithoutRef } from 'react';
import type { Tone } from './tone';
export type BadgeTone = Tone;
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
