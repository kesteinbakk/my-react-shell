// accent.ts — the shared accent vocabulary for the kit's structured cards
// (PhiCard, StatCard). An accent is a semantic hue the card carries as a stripe;
// `tone` picks a semantic `--color-*` token (the canonical {@link Tone}), a raw
// `color` string overrides it, and `accentPlacement` decides whether the stripe sits
// along the top or the left edge. Kept in one place so both cards share an identical
// API and colour mapping.
import { TONE_COLOR } from './tone';
/**
 * Resolve the accent paint: an explicit `color` wins over the semantic `tone`;
 * returns `undefined` when neither is given (the card shows no accent).
 */
export function resolveAccentColor(tone, color) {
    if (color != null)
        return color;
    if (tone != null)
        return TONE_COLOR[tone];
    return undefined;
}
