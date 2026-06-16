/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Convex deployment URL — no trailing slash. Written by `convex dev` into
   * `.env.local`, or set on the host. my-react-shell reads it in `createConvexClient`
   * and throws if it is absent (no silent default).
   */
  readonly VITE_CONVEX_URL?: string
}
