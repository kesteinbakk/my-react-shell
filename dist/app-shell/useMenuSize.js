/**
 * useMenuSize — read and set the header-chrome size preference (`small` ·
 * `medium` · `large`).
 *
 * A thin, stable wrapper over the menu-size context. Throws outside
 * <MenuSizeProvider>. Feed its value + setter into <UserPreferences>
 * (`menuSize` / `onMenuSizeChange`); <AppShell> reads the same preference itself
 * to scale its header chrome. Use `useMenuSizeOptional` for a non-throwing read.
 */
import { useMenuSizeContext, useMenuSizeContextOptional } from './menuSizeContext';
export function useMenuSize() {
    const ctx = useMenuSizeContext();
    return {
        menuSize: ctx.menuSize,
        setMenuSize: ctx.setMenuSize,
    };
}
/**
 * Non-throwing read of the menu-size preference — returns `null` outside a
 * <MenuSizeProvider>. This is the soft read <AppShell> uses, so a shell mounted
 * without the provider simply renders at the normal (`medium`) size.
 */
export function useMenuSizeOptional() {
    return useMenuSizeContextOptional();
}
