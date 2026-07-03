/**
 * MenuSizeProvider — owns the header-chrome size preference (`small` · `medium` ·
 * `large`). Mirrors <IconModeProvider>: uncontrolled by default (seeds from
 * localStorage and persists there, zero-config) and controllable via `value` +
 * `onChange` (own the state yourself, e.g. mirror it to a per-user account /
 * Convex; the provider then stops touching localStorage). SPA-only (no SSR).
 *
 * <AppShell> reads this softly (`useMenuSizeOptional`), so a consumer that never
 * mounts the provider is entirely unaffected — the size is `small` (normal). Pair
 * it with <UserPreferences> (`menuSize` / `onMenuSizeChange`) to give users the
 * control.
 */
import type { ReactNode } from 'react';
import type { MenuSize } from './menuSizeContext';
export type { MenuSize } from './menuSizeContext';
export interface MenuSizeProviderProps {
    children: ReactNode;
    /** Controlled value. Provide with `onChange` to own state + persistence yourself. */
    value?: MenuSize;
    /**
     * Change handler. In controlled mode it is the only writer; in uncontrolled mode
     * it fires alongside the internal update (so a consumer can additionally sync).
     */
    onChange?: (size: MenuSize) => void;
    /** Initial size when uncontrolled and nothing is persisted. Default `'small'`. */
    defaultSize?: MenuSize;
    /** localStorage key for uncontrolled persistence. Default `'my-react-shell.menu-size'`. */
    storageKey?: string;
}
export declare function MenuSizeProvider({ children, value, onChange, defaultSize, storageKey, }: MenuSizeProviderProps): import("react").JSX.Element;
