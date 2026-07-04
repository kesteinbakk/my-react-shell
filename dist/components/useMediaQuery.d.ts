/**
 * Subscribe to a CSS media query and return whether it currently matches. Reads the
 * value synchronously on first render (no flash, no post-mount effect) via
 * `useSyncExternalStore`, and re-renders when the match state changes.
 *
 * Pass `null` to disable the subscription (the hook still runs — so it can be called
 * unconditionally — and returns `false`).
 */
export declare function useMediaQuery(query: string | null): boolean;
