// tone.ts — the kit's canonical semantic-colour vocabulary.
//
// One `tone` type shared by every component that carries a semantic colour (Badge,
// Alert, Button, ActionButton, the structured cards, …). The kit's convention:
// **`tone` is what a thing means** (its semantic colour); **`variant` is what it looks
// like** (its structural style). Each tone maps to a `--color-*` token, so a component
// can resolve a paint without re-deriving the mapping.
//
// Components may narrow this set where a value makes no sense (e.g. `Alert` drops
// `primary`/`neutral` — a neutral note is `InfoBox`), but they never invent a parallel
// vocabulary.
/** Each tone → its theme token. `neutral` is a muted, non-coloured accent. */
export const TONE_COLOR = {
    primary: 'var(--color-primary)',
    info: 'var(--color-info)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    neutral: 'var(--color-text-secondary)',
};
