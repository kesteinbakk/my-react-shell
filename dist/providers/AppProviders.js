import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { ConvexProvider } from 'convex/react';
import { ThemeProvider } from '../theme/ThemeProvider';
import { I18nProvider } from '../i18n/I18nProvider';
import { withShellCatalog } from '../i18n/shellCatalog';
import { createConvexClient } from './convexClient';
/**
 * The single provider wrapper a consumer mounts above its router: theme + Convex
 * client + (optional) auth. Creates the Convex client once from `VITE_CONVEX_URL`
 * (throwing if absent — no silent default).
 */
export function AppProviders({ children, authProvider: Auth, client, theme = {}, i18n, }) {
    const [convex] = useState(() => client ?? createConvexClient());
    const convexTree = Auth ? (_jsx(Auth, { client: convex, children: children })) : (_jsx(ConvexProvider, { client: convex, children: children }));
    return (_jsx(ThemeProvider, { ...theme, children: i18n ? (_jsx(I18nProvider, { ...i18n, messages: withShellCatalog(i18n.messages), children: convexTree })) : (convexTree) }));
}
