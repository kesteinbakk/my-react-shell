/**
 * ThemeProvider
 *
 * Owns theme state and its single application to the DOM: it writes the active
 * `.theme-<name>-<mode>` class, `data-theme` / `data-mode` attributes, and
 * `color-scheme` onto <html>, follows the OS color scheme until the user picks
 * a mode, and persists the choice to localStorage. SPA-only (no SSR, per D2).
 *
 * Consumer-defined palettes: pass `themes` listing them and ship a matching
 * `.theme-<name>-light` / `.theme-<name>-dark` class filling the token contract.
 */
import type { ReactNode } from 'react';
import type { ThemeInfo, ThemeMode, ThemeName } from './themeContext';
export type { ThemeMode, ThemeName, ThemeInfo } from './themeContext';
export interface ThemeProviderProps {
    children: ReactNode;
    /** Palettes this app exposes. Defaults to the five built-ins. Pass a stable reference. */
    themes?: readonly ThemeInfo[];
    /** Palette used when nothing is persisted. Default `'soft'`. */
    defaultTheme?: ThemeName;
    /** Mode used when nothing is persisted and not following the system. Default `'light'`. */
    defaultMode?: ThemeMode;
    /** Follow the OS color scheme until the user picks a mode. Default `true`. */
    defaultFollowSystem?: boolean;
    /** localStorage key for persistence. Default `'my-react-shell.theme'`. */
    storageKey?: string;
    /**
     * Called whenever the user changes theme / mode / system-follow (not on initial
     * mount). Use it to mirror the choice to a backend or per-user account; the
     * provider keeps persisting to localStorage regardless.
     */
    onChange?: (state: {
        theme: ThemeName;
        mode: ThemeMode;
        followSystem: boolean;
    }) => void;
}
export declare function ThemeProvider({ children, themes, defaultTheme, defaultMode, defaultFollowSystem, storageKey, onChange, }: ThemeProviderProps): import("react").JSX.Element;
