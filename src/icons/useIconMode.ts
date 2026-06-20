/**
 * useIconMode — read and set the icons-vs-emojis display preference.
 *
 * A thin, stable wrapper over the icon-mode context. Throws outside
 * <IconModeProvider>. Feed its value + setter into <UserPreferences>, and read it
 * from a consumer's `renderIcon` so the whole UI flips between icons and emojis.
 */

import { useIconModeContext } from './iconModeContext'
import type { IconMode } from './iconModeContext'

export interface UseIconModeResult {
  /** Active display mode. */
  iconMode: IconMode
  /** `true` when emojis are active. */
  isEmoji: boolean
  /** Set the display mode. */
  setIconMode: (mode: IconMode) => void
  /** Flip between icons and emojis. */
  toggleIconMode: () => void
}

export function useIconMode(): UseIconModeResult {
  const ctx = useIconModeContext()
  return {
    iconMode: ctx.iconMode,
    isEmoji: ctx.iconMode === 'emoji',
    setIconMode: ctx.setIconMode,
    toggleIconMode: () => ctx.setIconMode(ctx.iconMode === 'emoji' ? 'icon' : 'emoji'),
  }
}
