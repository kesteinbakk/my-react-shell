import type { PopoverAlign, PopoverSide } from './Popover';
import type { IconButtonSize } from './iconButton';
/** What the closed trigger button shows for the active locale. */
export type LanguageTrigger = 'flag' | 'code' | 'globe';
export interface LanguagePickerProps {
    /**
     * What the trigger shows for the active locale: its `flag` (default), its short
     * `code` (e.g. "EN"), or a neutral `globe` (🌐).
     */
    trigger?: LanguageTrigger;
    /** Show a flag next to each language in the list. Defaults to `true`. */
    showFlags?: boolean;
    /** Accessible label for the trigger. Defaults to the built-in `mrs.action.selectLanguage`. */
    label?: string;
    /** Menu alignment along the trigger edge. Defaults to `end`. */
    align?: PopoverAlign;
    /** Side the menu opens toward. Defaults to `bottom`. */
    side?: PopoverSide;
    /** Trigger-button size on the shared icon-button scale. Default `md`. */
    size?: IconButtonSize;
    /** Extra classes on the trigger button content. */
    className?: string;
}
/**
 * A language switcher built on `DropdownMenu` — a menu of the app's configured
 * locales, each shown by its native name (endonym) and flag, with a checkmark on the
 * active one. Reads the i18n seam **softly**: it renders nothing when no
 * `<I18nProvider>` is mounted or fewer than two locales are configured (nothing to
 * pick), so it's safe to drop into a header unconditionally.
 *
 * ```tsx
 * <LanguagePicker />                 // flag trigger, flags in the list
 * <LanguagePicker trigger="code" />  // shows "EN" / "NO"
 * ```
 */
export declare function LanguagePicker({ trigger, showFlags, label, align, side, size, className, }: LanguagePickerProps): import("react").JSX.Element | null;
