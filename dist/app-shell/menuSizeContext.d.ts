/**
 * Menu-size context — the header-chrome size preference (`medium` · `large` ·
 * `xlarge`), isolated from the effectful <MenuSizeProvider> (same split as
 * iconModeContext / themeContext) so editing the provider doesn't mint a new
 * context identity on hot reload. Keep this file free of effects and component
 * imports.
 *
 * When set above `medium`, <AppShell> reads this softly and scales its header
 * chrome — the page-header band (breadcrumbs + actions + search) and the
 * top-header action cluster — leaving the app title untouched. A pure
 * UI/accessibility preference; it changes no data and no routing.
 */
/** Header-chrome size: `medium` (normal, the default) · `large` · `xlarge`. */
export type MenuSize = 'medium' | 'large' | 'xlarge';
export interface MenuSizeContextValue {
    /** Active header-chrome size. */
    menuSize: MenuSize;
    /** Set the header-chrome size. */
    setMenuSize: (size: MenuSize) => void;
}
export declare const MenuSizeContext: import("react").Context<MenuSizeContextValue | null>;
/** Read the menu-size context, or `null` when used outside a provider. */
export declare function useMenuSizeContextOptional(): MenuSizeContextValue | null;
/** Read the menu-size context. Throws when used outside <MenuSizeProvider>. */
export declare function useMenuSizeContext(): MenuSizeContextValue;
