import { jsx as _jsx } from "react/jsx-runtime";
/**
 * MenuSizeProvider — owns the header-chrome size preference (`small` · `medium` ·
 * `large`). Mirrors <IconModeProvider>: uncontrolled by default (seeds from
 * localStorage and persists there, zero-config) and controllable via `value` +
 * `onChange` (own the state yourself, e.g. mirror it to a per-user account /
 * Convex; the provider then stops touching localStorage). SPA-only (no SSR).
 *
 * <AppShell> reads this softly (`useMenuSizeOptional`), so a consumer that never
 * mounts the provider is entirely unaffected — the size is `medium` (normal). Pair
 * it with <UserPreferences> (`menuSize` / `onMenuSizeChange`) to give users the
 * control.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MenuSizeContext } from './menuSizeContext';
const DEFAULT_STORAGE_KEY = 'my-react-shell.menu-size';
function readPersisted(storageKey) {
    let raw;
    try {
        raw = window.localStorage.getItem(storageKey);
    }
    catch {
        return null; // storage blocked (e.g. privacy mode)
    }
    return raw === 'small' || raw === 'medium' || raw === 'large' ? raw : null;
}
export function MenuSizeProvider({ children, value, onChange, defaultSize = 'medium', storageKey = DEFAULT_STORAGE_KEY, }) {
    const controlled = value !== undefined;
    // Seeded once; ignored while controlled (where `value` is the source of truth).
    const [internal, setInternal] = useState(() => controlled ? value : (readPersisted(storageKey) ?? defaultSize));
    const menuSize = controlled ? value : internal;
    // Persist — uncontrolled only; a controlled consumer owns persistence.
    useEffect(() => {
        if (controlled)
            return;
        try {
            window.localStorage.setItem(storageKey, internal);
        }
        catch {
            /* ignore */
        }
    }, [controlled, internal, storageKey]);
    const setMenuSize = useCallback((size) => {
        if (!controlled)
            setInternal(size);
        onChange?.(size);
    }, [controlled, onChange]);
    const ctx = useMemo(() => ({ menuSize, setMenuSize }), [menuSize, setMenuSize]);
    return _jsx(MenuSizeContext.Provider, { value: ctx, children: children });
}
