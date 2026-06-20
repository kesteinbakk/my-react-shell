import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from './cn';
const svg = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};
const SlidersGlyph = (_jsxs("svg", { ...svg, width: 18, height: 18, "aria-hidden": "true", children: [_jsx("line", { x1: "21", x2: "14", y1: "4", y2: "4" }), _jsx("line", { x1: "10", x2: "3", y1: "4", y2: "4" }), _jsx("line", { x1: "21", x2: "12", y1: "12", y2: "12" }), _jsx("line", { x1: "8", x2: "3", y1: "12", y2: "12" }), _jsx("line", { x1: "21", x2: "16", y1: "20", y2: "20" }), _jsx("line", { x1: "12", x2: "3", y1: "20", y2: "20" }), _jsx("line", { x1: "14", x2: "14", y1: "2", y2: "6" }), _jsx("line", { x1: "8", x2: "8", y1: "10", y2: "14" }), _jsx("line", { x1: "16", x2: "16", y1: "18", y2: "22" })] }));
const SunGlyph = (_jsxs("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "12", r: "4" }), _jsx("path", { d: "M12 2v2" }), _jsx("path", { d: "M12 20v2" }), _jsx("path", { d: "m4.93 4.93 1.41 1.41" }), _jsx("path", { d: "m17.66 17.66 1.41 1.41" }), _jsx("path", { d: "M2 12h2" }), _jsx("path", { d: "M20 12h2" }), _jsx("path", { d: "m6.34 17.66-1.41 1.41" }), _jsx("path", { d: "m19.07 4.93-1.41 1.41" })] }));
const MoonGlyph = (_jsx("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: _jsx("path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }) }));
const MonitorGlyph = (_jsxs("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: [_jsx("rect", { width: "20", height: "14", x: "2", y: "3", rx: "2" }), _jsx("line", { x1: "8", x2: "16", y1: "21", y2: "21" }), _jsx("line", { x1: "12", x2: "12", y1: "17", y2: "21" })] }));
const CloseGlyph = (_jsxs("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: [_jsx("path", { d: "M18 6 6 18" }), _jsx("path", { d: "m6 6 12 12" })] }));
function Segment({ active, onClick, children, }) {
    return (_jsx("button", { type: "button", className: "mrs-prefs__seg-btn", "aria-pressed": active, onClick: onClick, children: children }));
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
export function UserPreferences({ theme, themes, onThemeChange, mode, onModeChange, followSystem, onFollowSystemChange, iconMode, onIconModeChange, accountActions, trigger, open, onOpenChange, triggerLabel = 'Preferences', title = 'Preferences', description, themeHeading = 'Theme', modeHeading = 'Appearance', displayHeading = 'Icons', lightLabel = 'Light', darkLabel = 'Dark', systemLabel = 'System', iconsLabel = 'Icons', emojisLabel = 'Emojis', closeLabel = 'Close', className, }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setOpen = (next) => {
        if (!isControlled)
            setInternalOpen(next);
        onOpenChange?.(next);
    };
    const showSystem = onFollowSystemChange !== undefined;
    const sys = followSystem === true;
    const showDisplay = iconMode !== undefined && onIconModeChange !== undefined;
    return (_jsxs(Dialog.Root, { open: isOpen, onOpenChange: setOpen, children: [_jsx(Dialog.Trigger, { asChild: true, children: trigger ?? (_jsx("button", { type: "button", className: "mrs-prefs-trigger", "aria-label": triggerLabel, title: triggerLabel, children: SlidersGlyph })) }), _jsxs(Dialog.Portal, { children: [_jsx(Dialog.Overlay, { className: "mrs-dialog__overlay" }), _jsxs(Dialog.Content, { className: cn('mrs-prefs', className), children: [_jsxs("div", { className: "mrs-prefs__header", children: [_jsx(Dialog.Title, { className: "mrs-prefs__title", children: title }), _jsx(Dialog.Close, { className: "mrs-prefs__close", "aria-label": closeLabel, children: CloseGlyph })] }), description != null && (_jsx(Dialog.Description, { className: "mrs-prefs__desc", children: description })), _jsxs("section", { className: "mrs-prefs__section", children: [_jsx("h3", { className: "mrs-prefs__heading", children: themeHeading }), _jsx("div", { className: "mrs-prefs__grid", role: "group", "aria-label": typeof themeHeading === 'string' ? themeHeading : undefined, children: themes.map((info) => (_jsx("button", { type: "button", className: "mrs-prefs__option", "aria-pressed": theme === info.name, onClick: () => onThemeChange(info.name), children: info.label }, info.name))) })] }), _jsxs("section", { className: "mrs-prefs__section", children: [_jsx("h3", { className: "mrs-prefs__heading", children: modeHeading }), _jsxs("div", { className: "mrs-prefs__seg", role: "group", "aria-label": typeof modeHeading === 'string' ? modeHeading : undefined, children: [_jsxs(Segment, { active: !sys && mode === 'light', onClick: () => onModeChange('light'), children: [SunGlyph, lightLabel] }), _jsxs(Segment, { active: !sys && mode === 'dark', onClick: () => onModeChange('dark'), children: [MoonGlyph, darkLabel] }), showSystem && (_jsxs(Segment, { active: sys, onClick: () => onFollowSystemChange(true), children: [MonitorGlyph, systemLabel] }))] })] }), showDisplay && (_jsxs("section", { className: "mrs-prefs__section", children: [_jsx("h3", { className: "mrs-prefs__heading", children: displayHeading }), _jsxs("div", { className: "mrs-prefs__seg", role: "group", "aria-label": typeof displayHeading === 'string' ? displayHeading : undefined, children: [_jsx(Segment, { active: iconMode === 'icon', onClick: () => onIconModeChange('icon'), children: iconsLabel }), _jsx(Segment, { active: iconMode === 'emoji', onClick: () => onIconModeChange('emoji'), children: emojisLabel })] })] })), accountActions != null && _jsx("div", { className: "mrs-prefs__account", children: accountActions })] })] })] }));
}
