import { ConvexReactClient } from 'convex/react';
/**
 * Create the Convex client from `VITE_CONVEX_URL`.
 *
 * No silent default (root CLAUDE.md): a missing URL is a hard error, never a
 * `localhost`-shaped fallback that passes locally and fails in prod. A trailing
 * slash is rejected too — it breaks the Convex sync websocket (close code 1006).
 */
export declare function createConvexClient(url?: string | undefined): ConvexReactClient;
