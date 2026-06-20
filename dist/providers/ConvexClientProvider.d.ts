import type { ReactNode } from 'react';
import type { ConvexReactClient } from 'convex/react';
export interface ConvexClientProviderProps {
    children: ReactNode;
    /** A pre-created client (tests/advanced). Defaults to one from `VITE_CONVEX_URL`. */
    client?: ConvexReactClient;
}
/**
 * Plain Convex provider (no auth). Creates the client once from `VITE_CONVEX_URL`
 * (throwing if absent). For an authenticated app use `<AppProviders>` with an
 * auth provider — the auth provider supplies the Convex context itself.
 */
export declare function ConvexClientProvider({ children, client }: ConvexClientProviderProps): import("react").JSX.Element;
