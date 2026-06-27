/**
 * AppMenu — the sidebar navigation column (menu mode of the shell).
 *
 * Renders a brand/subtitle head, the top-level page list, and an action footer.
 * Requires shell context (`useShellContext`). The active row is resolved by a
 * longest-prefix match of the current pathname against `config.pages` — pure
 * logic, memoized. `groupBreak` draws a divider before a non-first entry. There
 * are no badges / pills / notifications: a row is just a `<Link>` with the
 * consumer-resolved icon plus the label thunk.
 *
 * Side-agnostic: `<AppShell>` mounts the SAME component as both the static
 * desktop column and the mobile-drawer body, so this file knows nothing about
 * which side it sits on (the wrapper carries the border). Width is driven by the
 * `data-size` attribute; action-footer spacing by `data-dense` (≤ 3 actions).
 * Icons via `config.renderIcon`; the module ships no icon kit and no i18n.
 */
import type { ReactNode } from 'react';
export interface AppMenuProps {
    /** Action item render thunks for the footer. `[]` for none. */
    actions: Array<() => ReactNode>;
    /** Node rendered right of the brand (badge / pill). */
    titleAdornment?: () => ReactNode;
    /** Node rendered under the brand. */
    subtitle?: () => ReactNode;
    /** Column width: 160 / 224 / 288 px. Default `'md'`. */
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
export declare function AppMenu(props: AppMenuProps): ReactNode;
