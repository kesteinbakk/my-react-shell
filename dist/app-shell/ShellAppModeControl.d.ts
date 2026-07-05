/**
 * ShellAppModeControl — the app-mode segmented control the shell renders inline in the
 * header's right cluster, left of the actions (header mode), or in its own section under
 * the sidebar brand (menu mode).
 *
 * A soft read of shell context: renders nothing when there is no shell, no `appMode`
 * block, the app-mode is hidden, or fewer than two modes are available (the "only one
 * choice → don't show" rule). When `selectable` is false it renders a read-only
 * indicator — visible, not interactive. Built on the kit `SegmentedControl`, so it
 * inherits the shipped look. No i18n import: the group's accessible name comes from
 * the consumer's optional `ariaLabel` thunk (config), matching the rest of the
 * app-shell chrome labels.
 *
 * Header mode (`variant="header"`) additionally renders a mobile-only dropdown
 * switcher — a single "current mode ▾" trigger listing every mode, in place of the
 * segmented control, which doesn't have room to breathe in the narrow header row.
 * Both forms are always in the DOM; only visibility toggles, at the shell's one
 * breakpoint (matching the breadcrumb / page-header-actions mobile collapse). Menu
 * mode keeps the segmented control at every width — it already lives in its own
 * full-width sidebar/drawer column, so it isn't cramped the way the header is.
 */
import type { ReactNode } from 'react';
export interface ShellAppModeControlProps {
    /** Placement variant — drives the section's layout class. */
    variant: 'header' | 'menu';
}
export declare function ShellAppModeControl({ variant }: ShellAppModeControlProps): ReactNode;
