/**
 * LargeMenuProvider — owns the "large menu" display preference (enlarged header
 * chrome). Mirrors <IconModeProvider>: uncontrolled by default (seeds from
 * localStorage and persists there, zero-config) and controllable via `value` +
 * `onChange` (own the state yourself, e.g. mirror it to a per-user account /
 * Convex; the provider then stops touching localStorage). SPA-only (no SSR).
 *
 * <AppShell> reads this softly (`useLargeMenuOptional`), so a consumer that never
 * mounts the provider is entirely unaffected — the preference is off. Pair it with
 * <UserPreferences> (`largeMenu` / `onLargeMenuChange`) to give users the toggle.
 */
import type { ReactNode } from 'react';
export interface LargeMenuProviderProps {
    children: ReactNode;
    /** Controlled value. Provide with `onChange` to own state + persistence yourself. */
    value?: boolean;
    /**
     * Change handler. In controlled mode it is the only writer; in uncontrolled mode
     * it fires alongside the internal update (so a consumer can additionally sync).
     */
    onChange?: (large: boolean) => void;
    /** Initial value when uncontrolled and nothing is persisted. Default `false` (off). */
    defaultLarge?: boolean;
    /** localStorage key for uncontrolled persistence. Default `'my-react-shell.large-menu'`. */
    storageKey?: string;
}
export declare function LargeMenuProvider({ children, value, onChange, defaultLarge, storageKey, }: LargeMenuProviderProps): import("react").JSX.Element;
