/**
 * useTheme — the public hook for reading and changing the theme.
 *
 * A thin, stable wrapper over the theme context: current state plus the
 * actions, with a couple of derived conveniences (`isDark`, `getThemeInfo`).
 * All lifecycle (effects, listeners, DOM writes) lives in <ThemeProvider>.
 */
import { useThemeContext } from './themeContext';
export function useTheme() {
    const ctx = useThemeContext();
    return {
        theme: ctx.theme,
        mode: ctx.mode,
        isDark: ctx.mode === 'dark',
        isSystemMode: ctx.followSystem,
        themes: ctx.themes,
        setTheme: ctx.setTheme,
        setMode: ctx.setMode,
        setSystemMode: ctx.setFollowSystem,
        toggleMode: ctx.toggleMode,
        cycleTheme: ctx.cycleTheme,
        getThemeInfo: (name) => ctx.themes.find((t) => t.name === name),
    };
}
