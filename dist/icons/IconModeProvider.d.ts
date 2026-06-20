/**
 * IconModeProvider — owns the "icons vs emojis" display preference.
 *
 * Uncontrolled by default: seeds from localStorage and persists changes there,
 * zero-config. Controllable: pass `value` + `onChange` to own the state yourself
 * (e.g. mirror it to a per-user account / Convex), and the provider stops touching
 * localStorage. SPA-only (no SSR), matching <ThemeProvider>.
 */
import type { ReactNode } from 'react';
import type { IconMode } from './iconModeContext';
export type { IconMode } from './iconModeContext';
export interface IconModeProviderProps {
    children: ReactNode;
    /** Controlled value. Provide with `onChange` to own state + persistence yourself. */
    value?: IconMode;
    /**
     * Change handler. In controlled mode it is the only writer; in uncontrolled mode
     * it fires alongside the internal update (so a consumer can additionally sync).
     */
    onChange?: (mode: IconMode) => void;
    /** Initial mode when uncontrolled and nothing is persisted. Default `'icon'`. */
    defaultMode?: IconMode;
    /** localStorage key for uncontrolled persistence. Default `'my-react-shell.icon-mode'`. */
    storageKey?: string;
}
export declare function IconModeProvider({ children, value, onChange, defaultMode, storageKey, }: IconModeProviderProps): import("react").JSX.Element;
