/**
 * Menu-size context — the header-chrome size preference (`small` · `medium` ·
 * `large`), isolated from the effectful <MenuSizeProvider> (same split as
 * iconModeContext / themeContext) so editing the provider doesn't mint a new
 * context identity on hot reload. Keep this file free of effects and component
 * imports.
 *
 * When set above `small`, <AppShell> reads this softly and scales its header
 * chrome — the page-header band (breadcrumbs + actions + search) and the
 * top-header action cluster — leaving the app title untouched. A pure
 * UI/accessibility preference; it changes no data and no routing.
 */
import { createContext, useContext } from 'react';
export const MenuSizeContext = createContext(null);
/** Read the menu-size context, or `null` when used outside a provider. */
export function useMenuSizeContextOptional() {
    return useContext(MenuSizeContext);
}
/** Read the menu-size context. Throws when used outside <MenuSizeProvider>. */
export function useMenuSizeContext() {
    const ctx = useContext(MenuSizeContext);
    if (!ctx) {
        throw new Error('useMenuSize must be used within <MenuSizeProvider>');
    }
    return ctx;
}
