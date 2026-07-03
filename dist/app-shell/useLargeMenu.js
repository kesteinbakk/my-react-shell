/**
 * useLargeMenu — read and set the "large menu" display preference.
 *
 * A thin, stable wrapper over the large-menu context. Throws outside
 * <LargeMenuProvider>. Feed its value + setter into <UserPreferences>
 * (`largeMenu` / `onLargeMenuChange`); <AppShell> reads the same preference itself
 * to scale its header chrome. Use `useLargeMenuOptional` for a non-throwing read.
 */
import { useLargeMenuContext, useLargeMenuContextOptional } from './largeMenuContext';
export function useLargeMenu() {
    const ctx = useLargeMenuContext();
    return {
        largeMenu: ctx.largeMenu,
        setLargeMenu: ctx.setLargeMenu,
        toggleLargeMenu: () => ctx.setLargeMenu(!ctx.largeMenu),
    };
}
/**
 * Non-throwing read of the large-menu preference — returns `null` outside a
 * <LargeMenuProvider>. This is the soft read <AppShell> uses, so a shell mounted
 * without the provider simply renders at normal size.
 */
export function useLargeMenuOptional() {
    return useLargeMenuContextOptional();
}
