/**
 * useTheme — the public hook for reading and changing the theme.
 *
 * A thin, stable wrapper over the theme context: current state plus the
 * actions, with a couple of derived conveniences (`isDark`, `getThemeInfo`).
 * All lifecycle (effects, listeners, DOM writes) lives in <ThemeProvider>.
 */
import type { ThemeInfo, ThemeMode, ThemeName } from './themeContext';
export interface UseThemeResult {
    /** Active palette. */
    theme: ThemeName;
    /** Active mode. */
    mode: ThemeMode;
    /** `true` when the active mode is dark. */
    isDark: boolean;
    /** `true` when the mode is following the OS color scheme. */
    isSystemMode: boolean;
    /** Palettes this app exposes. */
    themes: readonly ThemeInfo[];
    /** Select a palette. */
    setTheme: (theme: ThemeName) => void;
    /** Set an explicit mode (stops following the system). */
    setMode: (mode: ThemeMode) => void;
    /** Enable/disable following the OS color scheme. */
    setSystemMode: (follow: boolean) => void;
    /** Flip light/dark (stops following the system). */
    toggleMode: () => void;
    /** Advance to the next palette. */
    cycleTheme: () => void;
    /** Look up the metadata for a palette by name. */
    getThemeInfo: (name: ThemeName) => ThemeInfo | undefined;
}
export declare function useTheme(): UseThemeResult;
