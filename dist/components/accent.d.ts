/** Semantic accent hue. Maps to a `--color-*` token (see {@link ACCENT_TONE_COLOR}). */
export type AccentTone = 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';
/** Where the accent stripe reads: along the `top` edge (default) or the `left` edge. */
export type AccentPlacement = 'top' | 'left';
/** Each semantic tone → its theme token. `neutral` is a muted, non-coloured accent. */
export declare const ACCENT_TONE_COLOR: Record<AccentTone, string>;
/**
 * Resolve the accent paint: an explicit `color` wins over the semantic `tone`;
 * returns `undefined` when neither is given (the card shows no accent).
 */
export declare function resolveAccentColor(tone: AccentTone | undefined, color: string | undefined): string | undefined;
