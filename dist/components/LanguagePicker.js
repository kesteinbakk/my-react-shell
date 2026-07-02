import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from './cn';
import { DropdownMenu } from './DropdownMenu';
import { Flag } from './Flag';
import { useShellText } from './useShellText';
import { useI18nContextOptional } from '../i18n/i18nContext';
import { localeMetaFor } from '../i18n/localeMeta';
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
export function LanguagePicker({ trigger = 'flag', showFlags = true, label, align = 'end', side = 'bottom', className, }) {
    const st = useShellText();
    const ctx = useI18nContextOptional();
    // No provider, or nothing to switch between → render nothing.
    if (ctx === null || ctx.locales.length < 2)
        return null;
    const { locale, locales, setLocale } = ctx;
    const triggerContent = trigger === 'globe' ? (_jsx("span", { "aria-hidden": "true", children: "\uD83C\uDF10" })) : trigger === 'code' ? (_jsx("span", { className: "mrs-lang-picker__code", children: localeMetaFor(locale)?.code ?? locale })) : (_jsx(Flag, { code: locale }));
    return (_jsx(DropdownMenu, { iconTrigger: _jsx("span", { className: cn('mrs-lang-picker__trigger', className), children: triggerContent }), iconTriggerLabel: label ?? st('mrs.action.selectLanguage'), align: align, side: side, items: [
            {
                type: 'radio-group',
                value: locale,
                onValueChange: setLocale,
                closeOnSelect: true,
                options: locales.map((l) => ({
                    value: l.code,
                    label: l.label,
                    icon: showFlags ? _jsx(Flag, { code: l.code }) : undefined,
                })),
            },
        ] }));
}
