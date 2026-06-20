/**
 * Icon-mode context — the "render icons or emojis" display preference, isolated
 * from the effectful <IconModeProvider> (same split as themeContext) so editing
 * the provider doesn't mint a new context identity on hot reload. Keep this file
 * free of effects and component imports.
 */
/** Whether UI glyphs render as SVG icons or their emoji equivalents. */
export type IconMode = 'icon' | 'emoji';
export interface IconModeContextValue {
    /** Active display mode. */
    iconMode: IconMode;
    /** Set the display mode. */
    setIconMode: (mode: IconMode) => void;
}
export declare const IconModeContext: import("react").Context<IconModeContextValue | null>;
/** Read the icon-mode context, or `null` when used outside a provider. */
export declare function useIconModeContextOptional(): IconModeContextValue | null;
/** Read the icon-mode context. Throws when used outside <IconModeProvider>. */
export declare function useIconModeContext(): IconModeContextValue;
