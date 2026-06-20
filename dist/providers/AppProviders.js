import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { ConvexProvider } from 'convex/react';
import { ThemeProvider } from '../theme/ThemeProvider';
import { createConvexClient } from './convexClient';
/**
 * The single provider wrapper a consumer mounts above its router: theme + Convex
 * client + (optional) auth. Creates the Convex client once from `VITE_CONVEX_URL`
 * (throwing if absent — no silent default).
 */
export function AppProviders({ children, authProvider: Auth, client, theme = {}, }) {
    const [convex] = useState(() => client ?? createConvexClient());
    return (_jsx(ThemeProvider, { ...theme, children: Auth ? (_jsx(Auth, { client: convex, children: children })) : (_jsx(ConvexProvider, { client: convex, children: children })) }));
}
