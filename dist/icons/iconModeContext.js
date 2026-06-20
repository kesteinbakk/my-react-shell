/**
 * Icon-mode context — the "render icons or emojis" display preference, isolated
 * from the effectful <IconModeProvider> (same split as themeContext) so editing
 * the provider doesn't mint a new context identity on hot reload. Keep this file
 * free of effects and component imports.
 */
import { createContext, useContext } from 'react';
export const IconModeContext = createContext(null);
/** Read the icon-mode context, or `null` when used outside a provider. */
export function useIconModeContextOptional() {
    return useContext(IconModeContext);
}
/** Read the icon-mode context. Throws when used outside <IconModeProvider>. */
export function useIconModeContext() {
    const ctx = useContext(IconModeContext);
    if (!ctx) {
        throw new Error('useIconMode must be used within <IconModeProvider>');
    }
    return ctx;
}
