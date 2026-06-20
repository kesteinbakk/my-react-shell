import type { ReactNode } from 'react';
import type { ConvexReactClient } from 'convex/react';
import type { ThemeProviderProps } from '../theme/ThemeProvider';
import type { AuthProvider } from '../auth/seam';
export interface AppProvidersProps {
    children: ReactNode;
    /**
     * The auth seam. Omit for a plain (unauthenticated) Convex app. For the Convex
     * Auth default, import `ConvexAuthDefaultProvider` from `my-react-shell/auth/convex`
     * and pass it here; for Better Auth / SSO, pass your own `AuthProvider`.
     */
    authProvider?: AuthProvider;
    /** A pre-created Convex client (tests/advanced). Defaults to one from `VITE_CONVEX_URL`. */
    client?: ConvexReactClient;
    /** Options forwarded to `<ThemeProvider>` (default palette, theme set, …). */
    theme?: Omit<ThemeProviderProps, 'children'>;
}
/**
 * The single provider wrapper a consumer mounts above its router: theme + Convex
 * client + (optional) auth. Creates the Convex client once from `VITE_CONVEX_URL`
 * (throwing if absent — no silent default).
 */
export declare function AppProviders({ children, authProvider: Auth, client, theme, }: AppProvidersProps): import("react").JSX.Element;
