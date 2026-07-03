import type { ReactNode } from 'react';
import type { ThemeInfo, ThemeMode, ThemeName } from '../theme/themeContext';
import type { IconMode } from '../icons/iconModeContext';
/**
 * A section rendered as one left-nav item + right pane in the two-pane
 * (sectioned) layout. Provide the full, ordered list via
 * {@link UserPreferencesProps.sections} to switch `<UserPreferences>` from its
 * single-column body to a category rail.
 *
 * Three ids are **reserved** and render built-in panes when their `content` is omitted:
 * `'theme'` (palette + light/dark/system), `'display'` (icons↔emojis + the large-menu
 * toggle) and `'language'` (the language switcher, driven off the mounted
 * `<I18nProvider>`). Include an entry with that `id` (and your own `icon`/`label`)
 * wherever you want it in the order; leave the entry out entirely to render no such
 * section.
 */
export interface UserPreferencesSection {
    /** Stable id — the nav key and selected-state value. The reserved `'theme'` / `'language'` ids render built-in panes. */
    id: string;
    /** Left-nav icon node (already mode-resolved by the consumer, e.g. `<AppIcon…>`). */
    icon: ReactNode;
    /** Left-nav text label (translated by the consumer). */
    label: ReactNode;
    /** Right-pane content shown when this section is active. Omit **only** for a reserved (`'theme'` / `'language'`) entry (the shell injects the pane); required for every other section. */
    content?: ReactNode;
}
export interface UserPreferencesProps {
    /** Active palette name. */
    theme: ThemeName;
    /** Palettes to offer. Pass `useTheme().themes`. */
    themes: readonly ThemeInfo[];
    /** Called when a palette is chosen. */
    onThemeChange: (theme: ThemeName) => void;
    /** Active color mode. */
    mode: ThemeMode;
    /** Called when light/dark is chosen. */
    onModeChange: (mode: ThemeMode) => void;
    /** Whether the mode currently follows the OS. Enables the "System" option when `onFollowSystemChange` is also set. */
    followSystem?: boolean;
    /** Called when "System" is chosen. Omit to hide the System option. */
    onFollowSystemChange?: (follow: boolean) => void;
    /** Active display mode. Omit (with `onIconModeChange`) to hide the control. */
    iconMode?: IconMode;
    /** Called when icons/emojis is chosen. Omit to hide the control. */
    onIconModeChange?: (mode: IconMode) => void;
    /**
     * Active large-menu preference — enlarges the app-shell header chrome (`~1.75×`).
     * Wire it to `useLargeMenu()` (my-react-shell/app-shell). Omit (with
     * `onLargeMenuChange`) to hide the control.
     */
    largeMenu?: boolean;
    /** Called when the large-menu preference is toggled. Omit to hide the control. */
    onLargeMenuChange?: (large: boolean) => void;
    /** Optional rows rendered below a divider — e.g. sign out / profile. The kit stays auth-free; you wire identity here. */
    accountActions?: ReactNode;
    /** Override the default trigger (an icon button). Rendered as the dialog trigger. */
    trigger?: ReactNode;
    /** Controlled open state. Omit to let the component manage its own. */
    open?: boolean;
    /** Open-state change handler. */
    onOpenChange?: (open: boolean) => void;
    /**
     * The **full, ordered** left-nav. Omit (or pass an empty array) → the
     * single-column, no-nav body. Pass one or more → the dialog widens into a
     * two-pane grid with a left icon+label nav and a swappable right pane, in
     * exactly the order given. Include an `{ id: 'theme' }` entry to place the
     * built-in palette/mode/display pane wherever you want it (or leave it out to
     * omit the theme section); every other entry supplies its own `content`.
     */
    sections?: UserPreferencesSection[];
    /**
     * The active section id (controlled). Pass this + `onActiveSectionChange` to
     * own the selection — e.g. persist it to `sessionStorage` so the dialog
     * reopens where the user left off. Omit both and the component remembers the
     * last-viewed section across close→reopen within its lifetime. An id absent
     * from `sections` falls back to the first nav item.
     */
    activeSection?: string;
    /** Called with the newly-selected section id when the user picks a nav item. */
    onActiveSectionChange?: (id: string) => void;
    triggerLabel: string;
    title: ReactNode;
    /** Optional supporting line under the title. */
    description?: ReactNode;
    themeHeading: ReactNode;
    modeHeading: ReactNode;
    displayHeading: ReactNode;
    lightLabel: ReactNode;
    darkLabel: ReactNode;
    systemLabel: ReactNode;
    iconsLabel: ReactNode;
    emojisLabel: ReactNode;
    /** Heading for the large-menu control. Optional — defaults to `mrs.prefs.largeMenuHeading`. */
    largeMenuHeading?: ReactNode;
    /** Label for the "off" (normal) large-menu segment. Optional — defaults to `mrs.prefs.largeMenuOff`. */
    largeMenuOffLabel?: ReactNode;
    /** Label for the "on" (large) large-menu segment. Optional — defaults to `mrs.prefs.largeMenuOn`. */
    largeMenuOnLabel?: ReactNode;
    /** Accessible label for the close ✕. Optional — defaults to the built-in `mrs.action.close`. */
    closeLabel?: string;
    className?: string;
}
/**
 * <UserPreferences> — a drop-in user-options panel in a Radix dialog opened from an
 * icon button. Two built-in control groups: **theme** (palette + light/dark/system)
 * and **display** (an optional icons↔emojis switch + an optional large-menu toggle
 * that enlarges the app-shell header chrome). In the single-column layout both groups
 * stack; in the sectioned layout they are the reserved `'theme'` and `'display'` panes.
 *
 * Fully **controlled** — it reads the current values and emits an `onChange` for each
 * preference, and persists nothing itself, so the consumer decides where state lives
 * (localStorage via the shipped providers, or a per-user account / Convex). Auth-free:
 * surface sign-out / profile through the `accountActions` slot. Every label is a
 * **required, no-default prop** — pass translated strings via your t() seam, so the
 * kit never imports i18n and never renders a hardcoded language.
 */
export declare function UserPreferences({ theme, themes, onThemeChange, mode, onModeChange, followSystem, onFollowSystemChange, iconMode, onIconModeChange, largeMenu, onLargeMenuChange, accountActions, trigger, open, onOpenChange, sections, activeSection, onActiveSectionChange, triggerLabel, title, description, themeHeading, modeHeading, displayHeading, lightLabel, darkLabel, systemLabel, iconsLabel, emojisLabel, largeMenuHeading, largeMenuOffLabel, largeMenuOnLabel, closeLabel, className, }: UserPreferencesProps): import("react").JSX.Element;
