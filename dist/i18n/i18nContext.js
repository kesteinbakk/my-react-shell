/**
 * i18n context — intentionally minimal and stable.
 *
 * `createContext` and the public i18n types live here, isolated from the
 * effectful <I18nProvider>, so editing the provider does not re-run
 * `createContext` and mint a new context identity on hot reload. Keep this
 * module free of effects and component imports (mirrors themeContext).
 */
import { createContext, useContext } from 'react';
// The context identity is untyped (`string`-keyed); the hooks/factory narrow the
// read view to a bound `K`. One context, one runtime value — never re-created per
// key type.
export const I18nContext = createContext(null);
/** Read the i18n context. Throws if used outside <I18nProvider>. */
export function useI18nContext() {
    const ctx = useContext(I18nContext);
    if (!ctx) {
        throw new Error('useI18nContext must be used within <I18nProvider>');
    }
    return ctx;
}
