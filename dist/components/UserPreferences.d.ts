import type { ReactNode } from 'react';
import type { ThemeInfo, ThemeMode, ThemeName } from '../theme/themeContext';
import type { IconMode } from '../icons/iconModeContext';
/**
 * A consumer-supplied section rendered as an extra left-nav item + right pane in
 * the two-pane (sectioned) layout. Provide one or more via {@link UserPreferencesProps.sections}
 * to switch `<UserPreferences>` from its single-column body to a category rail.
 */
export interface UserPreferencesSection {
    /** Stable id — used as the nav key and the selected-state value. Reserved: `'theme'`. */
    id: string;
    /** Left-nav icon node (already mode-resolved by the consumer, e.g. `<AppIcon…>`). */
    icon: ReactNode;
    /** Left-nav text label (translated by the consumer). */
    label: ReactNode;
    /** Right-pane content shown when this section is active. */
    content: ReactNode;
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
    /** Active display mode. Omit (with `onIconModeChange`) to hide the section. */
    iconMode?: IconMode;
    /** Called when icons/emojis is chosen. Omit to hide the section. */
    onIconModeChange?: (mode: IconMode) => void;
    /** Optional rows rendered below a divider — e.g. sign out / profile. The kit stays auth-free; you wire identity here. */
    accountActions?: ReactNode;
    /** Override the default trigger (an icon button). Rendered as the dialog trigger. */
    trigger?: ReactNode;
    /** Controlled open state. Omit to let the component manage its own. */
    open?: boolean;
    /** Open-state change handler. */
    onOpenChange?: (open: boolean) => void;
    /**
     * Extra sections appended after the built-in **Theme** section. Omit (or pass
     * an empty array) → today's single-column, no-nav body is preserved exactly
     * (backward compatible). Pass one or more → the dialog widens into a two-pane
     * grid with a left icon+label nav and a swappable right pane.
     */
    sections?: UserPreferencesSection[];
    /**
     * Left-nav label for the built-in Theme section. Required in practice when
     * `sections` is non-empty (the two-pane nav needs a name for the theme pane);
     * ignored when `sections` is omitted.
     */
    themeSectionLabel?: ReactNode;
    /** Left-nav icon for the built-in Theme section. Same conditionality as `themeSectionLabel`. */
    themeSectionIcon?: ReactNode;
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
    closeLabel: string;
    className?: string;
}
/**
 * <UserPreferences> — a drop-in user-options panel: theme palette + light/dark/system
 * + an optional icons↔emojis switch, in a Radix dialog opened from an icon button.
 *
 * Fully **controlled** — it reads the current values and emits an `onChange` for each
 * preference, and persists nothing itself, so the consumer decides where state lives
 * (localStorage via the shipped providers, or a per-user account / Convex). Auth-free:
 * surface sign-out / profile through the `accountActions` slot. Every label is a
 * **required, no-default prop** — pass translated strings via your t() seam, so the
 * kit never imports i18n and never renders a hardcoded language.
 */
export declare function UserPreferences({ theme, themes, onThemeChange, mode, onModeChange, followSystem, onFollowSystemChange, iconMode, onIconModeChange, accountActions, trigger, open, onOpenChange, sections, themeSectionLabel, themeSectionIcon, triggerLabel, title, description, themeHeading, modeHeading, displayHeading, lightLabel, darkLabel, systemLabel, iconsLabel, emojisLabel, closeLabel, className, }: UserPreferencesProps): import("react").JSX.Element;
