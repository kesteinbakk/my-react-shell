/**
 * Large-menu context — the opt-in "large menu" display preference, isolated from
 * the effectful <LargeMenuProvider> (same split as iconModeContext / themeContext)
 * so editing the provider doesn't mint a new context identity on hot reload. Keep
 * this file free of effects and component imports.
 *
 * When enabled, <AppShell> reads this softly and scales its header chrome — the
 * page-header band (breadcrumbs + actions + search) and the top-header action
 * cluster — to ~2×, leaving the app title untouched. A pure UI/accessibility
 * preference; it changes no data and no routing.
 */

import { createContext, useContext } from 'react'

export interface LargeMenuContextValue {
  /** `true` when the large-menu (enlarged header chrome) preference is on. */
  largeMenu: boolean
  /** Set the large-menu preference. */
  setLargeMenu: (large: boolean) => void
}

export const LargeMenuContext = createContext<LargeMenuContextValue | null>(null)

/** Read the large-menu context, or `null` when used outside a provider. */
export function useLargeMenuContextOptional(): LargeMenuContextValue | null {
  return useContext(LargeMenuContext)
}

/** Read the large-menu context. Throws when used outside <LargeMenuProvider>. */
export function useLargeMenuContext(): LargeMenuContextValue {
  const ctx = useContext(LargeMenuContext)
  if (!ctx) {
    throw new Error('useLargeMenu must be used within <LargeMenuProvider>')
  }
  return ctx
}
