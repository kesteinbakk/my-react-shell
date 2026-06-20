/**
 * Icon-mode context — the "render icons or emojis" display preference, isolated
 * from the effectful <IconModeProvider> (same split as themeContext) so editing
 * the provider doesn't mint a new context identity on hot reload. Keep this file
 * free of effects and component imports.
 */

import { createContext, useContext } from 'react'

/** Whether UI glyphs render as SVG icons or their emoji equivalents. */
export type IconMode = 'icon' | 'emoji'

export interface IconModeContextValue {
  /** Active display mode. */
  iconMode: IconMode
  /** Set the display mode. */
  setIconMode: (mode: IconMode) => void
}

export const IconModeContext = createContext<IconModeContextValue | null>(null)

/** Read the icon-mode context, or `null` when used outside a provider. */
export function useIconModeContextOptional(): IconModeContextValue | null {
  return useContext(IconModeContext)
}

/** Read the icon-mode context. Throws when used outside <IconModeProvider>. */
export function useIconModeContext(): IconModeContextValue {
  const ctx = useContext(IconModeContext)
  if (!ctx) {
    throw new Error('useIconMode must be used within <IconModeProvider>')
  }
  return ctx
}
