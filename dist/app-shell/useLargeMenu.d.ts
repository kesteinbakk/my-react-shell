/**
 * useLargeMenu — read and set the "large menu" display preference.
 *
 * A thin, stable wrapper over the large-menu context. Throws outside
 * <LargeMenuProvider>. Feed its value + setter into <UserPreferences>
 * (`largeMenu` / `onLargeMenuChange`); <AppShell> reads the same preference itself
 * to scale its header chrome. Use `useLargeMenuOptional` for a non-throwing read.
 */
import type { LargeMenuContextValue } from './largeMenuContext';
export interface UseLargeMenuResult {
    /** `true` when the large-menu (enlarged header chrome) preference is on. */
    largeMenu: boolean;
    /** Set the preference. */
    setLargeMenu: (large: boolean) => void;
    /** Flip the preference. */
    toggleLargeMenu: () => void;
}
export declare function useLargeMenu(): UseLargeMenuResult;
/**
 * Non-throwing read of the large-menu preference — returns `null` outside a
 * <LargeMenuProvider>. This is the soft read <AppShell> uses, so a shell mounted
 * without the provider simply renders at normal size.
 */
export declare function useLargeMenuOptional(): LargeMenuContextValue | null;
