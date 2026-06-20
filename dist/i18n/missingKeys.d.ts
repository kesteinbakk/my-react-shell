/**
 * Missing-key store — module-level, provider-free.
 *
 * `t()` records every key it cannot resolve here (in dev). The store is an
 * external store (`subscribe` + `getSnapshot`) so React can read it with
 * `useSyncExternalStore` — that is what <MissingTranslationsOverlay> renders.
 * No provider, no context: import and use directly.
 */
export interface MissingKey {
    /** The full (namespaced) key that failed to resolve. */
    key: string;
    /** The active locale at the time of the miss. */
    locale: string;
    /** `Date.now()` of the first sighting. */
    at: number;
}
export declare const missingKeyStore: {
    /** Subscribe to changes. Returns an unsubscribe. */
    subscribe(listener: () => void): () => void;
    /** Current snapshot — a stable reference until the next mutation. */
    getSnapshot(): readonly MissingKey[];
    /** Record a miss. De-duplicated by (key, locale). */
    add(key: string, locale: string): void;
    /** Drop all recorded misses. */
    clear(): void;
};
