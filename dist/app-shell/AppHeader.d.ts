/**
 * AppHeader — the full-width top banner (header mode of the shell).
 *
 * Works inside `<AppShell>` (reads `config.appName` / `appNameRender` from
 * context) and standalone (the consumer passes `title`). Actions are plain
 * render thunks — no built-in keys, no registry, no validator; the consumer
 * composes the row from its own widgets. Every user-facing string is a thunk or
 * a config value; the module never imports i18n. The home link is a TanStack
 * `<Link>`; classes are `mrs-app-header*` from app-shell.css.
 */
import type { ReactNode } from 'react';
export interface AppHeaderProps {
    /** Action item render thunks, rendered in the right zone. `[]` for none. */
    actions: Array<() => ReactNode>;
    /** Brand text. Required standalone; inside the shell falls back to `config.appName`. */
    title?: string;
    /** Home-link target. Default `'/'`. */
    homeRoute?: string;
    /** Node rendered right of the brand (badge / pill). */
    titleAdornment?: () => ReactNode;
    /** Node rendered under / beside the brand. */
    subtitle?: () => ReactNode;
    className?: string;
}
export declare function AppHeader(props: AppHeaderProps): ReactNode;
