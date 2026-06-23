export type Tone = 'primary' | 'neutral' | 'info' | 'success' | 'warning' | 'danger';
/** Each tone → its theme token. `neutral` is a muted, non-coloured accent. */
export declare const TONE_COLOR: Record<Tone, string>;
