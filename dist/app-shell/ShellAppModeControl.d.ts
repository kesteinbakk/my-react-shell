/**
 * ShellAppModeControl — the app-mode segmented control the shell renders in its own
 * section under the app title (header mode) or under the sidebar brand (menu mode).
 *
 * A soft read of shell context: renders nothing when there is no shell, no `appMode`
 * block, the app-mode is hidden, or fewer than two modes are available (the "only one
 * choice → don't show" rule). When `selectable` is false it renders a read-only
 * indicator — visible, not interactive. Built on the kit `SegmentedControl`, so it
 * inherits the shipped look. No i18n import: the group's accessible name comes from
 * the consumer's optional `ariaLabel` thunk (config), matching the rest of the
 * app-shell chrome labels.
 */
import type { ReactNode } from 'react';
export interface ShellAppModeControlProps {
    /** Placement variant — drives the section's layout class. */
    variant: 'header' | 'menu';
}
export declare function ShellAppModeControl({ variant }: ShellAppModeControlProps): ReactNode;
