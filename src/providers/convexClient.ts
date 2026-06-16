import { ConvexReactClient } from 'convex/react'

/**
 * Create the Convex client from `VITE_CONVEX_URL`.
 *
 * No silent default (root CLAUDE.md): a missing URL is a hard error, never a
 * `localhost`-shaped fallback that passes locally and fails in prod. A trailing
 * slash is rejected too — it breaks the Convex sync websocket (close code 1006).
 */
export function createConvexClient(
  url: string | undefined = import.meta.env.VITE_CONVEX_URL,
): ConvexReactClient {
  if (url === undefined || url === '') {
    throw new Error(
      'my-react-shell: VITE_CONVEX_URL is required but is not set. Set it in .env.local ' +
        '(written by `convex dev`) or your host environment — my-react-shell does not default it.',
    )
  }
  if (url.endsWith('/')) {
    throw new Error(
      `my-react-shell: VITE_CONVEX_URL must not end with a trailing slash (got "${url}") — ` +
        'a trailing slash breaks the Convex sync websocket (close code 1006).',
    )
  }
  return new ConvexReactClient(url)
}
