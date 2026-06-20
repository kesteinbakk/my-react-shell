import type { ReactNode } from 'react';
import type { ThemeInfo, ThemeMode, ThemeName } from '../theme/themeContext';
import type { IconMode } from '../icons/iconModeContext';
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
    triggerLabel?: string;
    title?: ReactNode;
    description?: ReactNode;
    themeHeading?: ReactNode;
    modeHeading?: ReactNode;
    displayHeading?: ReactNode;
    lightLabel?: ReactNode;
    darkLabel?: ReactNode;
    systemLabel?: ReactNode;
    iconsLabel?: ReactNode;
    emojisLabel?: ReactNode;
    closeLabel?: string;
    className?: string;
}
/**
 * <UserPreferences> — a drop-in user-options panel: theme palette + light/dark/system
 * + an optional icons↔emojis switch, in a Radix dialog opened from an icon button.
 *
 * Fully **controlled** — it reads the current values and emits an `onChange` for each
 * preference, and persists nothing itself, so the consumer decides where state lives
 * (localStorage via the shipped providers, or a per-user account / Convex). Auth-free:
 * surface sign-out / profile through the `accountActions` slot. Labels come via props
 * (English defaults), so the kit never imports i18n.
 */
export declare function UserPreferences({ theme, themes, onThemeChange, mode, onModeChange, followSystem, onFollowSystemChange, iconMode, onIconModeChange, accountActions, trigger, open, onOpenChange, triggerLabel, title, description, themeHeading, modeHeading, displayHeading, lightLabel, darkLabel, systemLabel, iconsLabel, emojisLabel, closeLabel, className, }: UserPreferencesProps): import("react").JSX.Element;
