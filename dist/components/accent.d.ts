import type { Tone } from './tone';
/** Where the accent stripe reads: along the `top` edge (default) or the `left` edge. */
export type AccentPlacement = 'top' | 'left';
/**
 * Resolve the accent paint: an explicit `color` wins over the semantic `tone`;
 * returns `undefined` when neither is given (the card shows no accent).
 */
export declare function resolveAccentColor(tone: Tone | undefined, color: string | undefined): string | undefined;
