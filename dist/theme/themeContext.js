/**
 * Theme context — intentionally minimal and stable.
 *
 * `createContext` and the theme types/constants live here, isolated from the
 * effectful <ThemeProvider>, so editing the provider does not re-run
 * `createContext` and mint a new context identity on hot reload. Keep this
 * module free of effects and component imports.
 */
import { createContext, useContext } from 'react';
/** The five built-in palettes, in display order. `golden` is intentionally absent. */
export const BUILT_IN_THEMES = [
    { name: 'ocean', label: 'Ocean', description: 'Deep sea blues and cool tones' },
    { name: 'forest', label: 'Forest', description: 'Natural greens and earth tones' },
    { name: 'sunset', label: 'Sunset', description: 'Warm oranges and fuchsia' },
    { name: 'soft', label: 'Soft', description: 'Muted, gentle colors with subtle contrasts' },
    { name: 'dynamic', label: 'Dynamic', description: 'High contrast with vibrant accents' },
];
export const ThemeContext = createContext(null);
/** Read the theme context. Throws if used outside <ThemeProvider>. */
export function useThemeContext() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useThemeContext must be used within <ThemeProvider>');
    }
    return ctx;
}
