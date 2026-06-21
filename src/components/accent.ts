// accent.ts — the shared accent vocabulary for the kit's structured cards
// (PhiCard, StatCard). An accent is a semantic hue the card carries as a stripe;
// `tone` picks a semantic `--color-*` token, a raw `color` string overrides it, and
// `accentPlacement` decides whether the stripe sits along the top or the left edge.
// Kept in one place so both cards share an identical API and colour mapping.

/** Semantic accent hue. Maps to a `--color-*` token (see {@link ACCENT_TONE_COLOR}). */
export type AccentTone = 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'neutral'

/** Where the accent stripe reads: along the `top` edge (default) or the `left` edge. */
export type AccentPlacement = 'top' | 'left'

/** Each semantic tone → its theme token. `neutral` is a muted, non-coloured accent. */
export const ACCENT_TONE_COLOR: Record<AccentTone, string> = {
  primary: 'var(--color-primary)',
  info: 'var(--color-info)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  neutral: 'var(--color-text-secondary)',
}

/**
 * Resolve the accent paint: an explicit `color` wins over the semantic `tone`;
 * returns `undefined` when neither is given (the card shows no accent).
 */
export function resolveAccentColor(
  tone: AccentTone | undefined,
  color: string | undefined,
): string | undefined {
  if (color != null) return color
  if (tone != null) return ACCENT_TONE_COLOR[tone]
  return undefined
}
