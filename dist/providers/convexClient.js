import { ConvexReactClient } from 'convex/react';
/**
 * Create the Convex client from `VITE_CONVEX_URL`.
 *
 * No silent default (root CLAUDE.md): a missing URL is a hard error, never a
 * `localhost`-shaped fallback that passes locally and fails in prod. A trailing
 * slash is rejected too — it breaks the Convex sync websocket (close code 1006).
 */
export function createConvexClient(url = import.meta.env.VITE_CONVEX_URL) {
    if (url === undefined || url === '') {
        throw new Error('my-react-shell: VITE_CONVEX_URL is required but is not set. Set it in .env.local ' +
            '(written by `convex dev`) or your host environment — my-react-shell does not default it.');
    }
    if (url.endsWith('/')) {
        throw new Error(`my-react-shell: VITE_CONVEX_URL must not end with a trailing slash (got "${url}") — ` +
            'a trailing slash breaks the Convex sync websocket (close code 1006).');
    }
    // Disable the built-in unsaved-changes dialog unconditionally. Convex registers
    // a beforeunload listener unless this is exactly `false`; passing a computed
    // `!import.meta.env.DEV` is unreliable in a consumed dist (the env substitution
    // does not happen when the shell's dist/ is resolved via a link: dep, leaving
    // import.meta.env.DEV as undefined — !undefined = true — so the warning fires).
    // Unconditionally false is correct: consumers use debounced autosave everywhere;
    // there is nothing this dialog protects that the autosave pattern does not already
    // cover. Convex mutations also complete server-side regardless of client disconnect.
    return new ConvexReactClient(url, {
        unsavedChangesWarning: false,
    });
}
