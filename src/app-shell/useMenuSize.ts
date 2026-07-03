/**
 * useMenuSize — read and set the header-chrome size preference (`medium` ·
 * `large` · `xlarge`).
 *
 * A thin, stable wrapper over the menu-size context. Throws outside
 * <MenuSizeProvider>. Feed its value + setter into <UserPreferences>
 * (`menuSize` / `onMenuSizeChange`); <AppShell> reads the same preference itself
 * to scale its header chrome. Use `useMenuSizeOptional` for a non-throwing read.
 */

import { useMenuSizeContext, useMenuSizeContextOptional } from './menuSizeContext'
import type { MenuSize, MenuSizeContextValue } from './menuSizeContext'

export interface UseMenuSizeResult {
  /** Active header-chrome size (`medium` · `large` · `xlarge`). */
  menuSize: MenuSize
  /** Set the size. */
  setMenuSize: (size: MenuSize) => void
}

export function useMenuSize(): UseMenuSizeResult {
  const ctx = useMenuSizeContext()
  return {
    menuSize: ctx.menuSize,
    setMenuSize: ctx.setMenuSize,
  }
}

/**
 * Non-throwing read of the menu-size preference — returns `null` outside a
 * <MenuSizeProvider>. This is the soft read <AppShell> uses, so a shell mounted
 * without the provider simply renders at the normal (`medium`) size.
 */
export function useMenuSizeOptional(): MenuSizeContextValue | null {
  return useMenuSizeContextOptional()
}
