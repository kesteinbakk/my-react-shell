/**
 * Missing-key store — module-level, provider-free.
 *
 * `t()` records every key it cannot resolve here (in dev). The store is an
 * external store (`subscribe` + `getSnapshot`) so React can read it with
 * `useSyncExternalStore` — that is what <MissingTranslationsOverlay> renders.
 * No provider, no context: import and use directly.
 */
let entries = [];
const listeners = new Set();
function emit() {
    for (const listener of listeners)
        listener();
}
export const missingKeyStore = {
    /** Subscribe to changes. Returns an unsubscribe. */
    subscribe(listener) {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
    /** Current snapshot — a stable reference until the next mutation. */
    getSnapshot() {
        return entries;
    },
    /** Record a miss. De-duplicated by (key, locale). */
    add(key, locale) {
        if (entries.some((e) => e.key === key && e.locale === locale))
            return;
        entries = [...entries, { key, locale, at: Date.now() }];
        emit();
    },
    /** Drop all recorded misses. */
    clear() {
        if (entries.length === 0)
            return;
        entries = [];
        emit();
    },
};
