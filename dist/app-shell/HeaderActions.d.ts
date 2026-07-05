/**
 * HeaderActions — the shell-owned chrome action row (AppHeader banner + AppMenu
 * sidebar footer).
 *
 * ONE trigger primitive, ONE box model. A consumer describes each action as data —
 * a clean registry icon key + label + intent (onClick / menu items / popover panel)
 * — and the shell renders every one through the same `HeaderActionButton`. There is
 * no way to pass a raw button, a wrapper, or a size: uniformity is enforced by the
 * `HeaderAction` type, not by convention. The rare irreducible case (an overlay the
 * declarative shapes can't express — e.g. the `UserPreferences` dialog) uses the
 * `custom` escape hatch, which HANDS the consumer the same uniform trigger to wrap,
 * so even bespoke overlays keep the identical chrome.
 *
 * Empty-safe: an action whose glyph resolves to nothing is skipped, and because the
 * shell owns rendering there is no wrapper element left behind to distort spacing.
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { HeaderAction, HeaderActionTriggerProps } from './shellContract';
/**
 * The single header-action trigger chrome. Exported so the `custom` escape hatch can
 * wire it into a bespoke overlay (as a Radix `asChild` trigger — it forwards its ref).
 * Everything in the `actions` row is this one button; that is what guarantees a uniform
 * box model. `icon` is a registry key (resolved via `config.renderIcon`) or a
 * pre-resolved node.
 */
export declare const HeaderActionButton: import("react").ForwardRefExoticComponent<HeaderActionTriggerProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type"> & import("react").RefAttributes<HTMLButtonElement>>;
/**
 * Render the shell's action cluster. Returns the trigger elements only — the caller
 * (AppHeader / AppMenu) supplies the surrounding container so header and sidebar keep
 * their own layout while sharing one action chrome.
 */
export declare function HeaderActions({ actions }: {
    actions: HeaderAction[];
}): ReactNode;
