import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { ConvexProvider } from 'convex/react';
import { createConvexClient } from './convexClient';
/**
 * Plain Convex provider (no auth). Creates the client once from `VITE_CONVEX_URL`
 * (throwing if absent). For an authenticated app use `<AppProviders>` with an
 * auth provider — the auth provider supplies the Convex context itself.
 */
export function ConvexClientProvider({ children, client }) {
    const [convex] = useState(() => client ?? createConvexClient());
    return _jsx(ConvexProvider, { client: convex, children: children });
}
