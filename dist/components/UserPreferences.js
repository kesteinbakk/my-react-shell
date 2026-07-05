import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useI18nContextOptional } from '../i18n/i18nContext';
import { Button } from './Button';
import { cn } from './cn';
import { Flag } from './Flag';
import { useShellText } from './useShellText';
const svg = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};
const SunGlyph = (_jsxs("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "12", r: "4" }), _jsx("path", { d: "M12 2v2" }), _jsx("path", { d: "M12 20v2" }), _jsx("path", { d: "m4.93 4.93 1.41 1.41" }), _jsx("path", { d: "m17.66 17.66 1.41 1.41" }), _jsx("path", { d: "M2 12h2" }), _jsx("path", { d: "M20 12h2" }), _jsx("path", { d: "m6.34 17.66-1.41 1.41" }), _jsx("path", { d: "m19.07 4.93-1.41 1.41" })] }));
const MoonGlyph = (_jsx("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: _jsx("path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }) }));
const MonitorGlyph = (_jsxs("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: [_jsx("rect", { width: "20", height: "14", x: "2", y: "3", rx: "2" }), _jsx("line", { x1: "8", x2: "16", y1: "21", y2: "21" }), _jsx("line", { x1: "12", x2: "12", y1: "17", y2: "21" })] }));
const SmileGlyph = (_jsxs("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("path", { d: "M8 14s1.5 2 4 2 4-2 4-2" }), _jsx("line", { x1: "9", x2: "9.01", y1: "9", y2: "9" }), _jsx("line", { x1: "15", x2: "15.01", y1: "9", y2: "9" })] }));
const CloseGlyph = (_jsxs("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: [_jsx("path", { d: "M18 6 6 18" }), _jsx("path", { d: "m6 6 12 12" })] }));
// ── Menu-size glyph (the "A" grows across the small/medium/large segments) ───
function SizeGlyph({ size }) {
    return (_jsxs("svg", { ...svg, width: size, height: size, "aria-hidden": "true", children: [_jsx("path", { d: "M5 20 12 5l7 15" }), _jsx("path", { d: "M8.5 14h7" })] }));
}
// ── Palette glyphs (icon mode) ───────────────────────────────────────────────
const WavesGlyph = (_jsxs("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: [_jsx("path", { d: "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" }), _jsx("path", { d: "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" }), _jsx("path", { d: "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" })] }));
const TreeGlyph = (_jsxs("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: [_jsx("path", { d: "m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z" }), _jsx("path", { d: "M12 22v-3" })] }));
const SunsetGlyph = (_jsxs("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: [_jsx("path", { d: "M12 10V2" }), _jsx("path", { d: "m4.93 10.93 1.41 1.41" }), _jsx("path", { d: "M2 18h2" }), _jsx("path", { d: "M20 18h2" }), _jsx("path", { d: "m19.07 10.93-1.41 1.41" }), _jsx("path", { d: "M22 22H2" }), _jsx("path", { d: "m16 6-4 4-4-4" }), _jsx("path", { d: "M16 18a4 4 0 0 0-8 0" })] }));
const CloudGlyph = (_jsx("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: _jsx("path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" }) }));
const ZapGlyph = (_jsx("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: _jsx("path", { d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" }) }));
const PaletteGlyph = (_jsxs("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: [_jsx("circle", { cx: "13.5", cy: "6.5", r: ".5", fill: "currentColor" }), _jsx("circle", { cx: "17.5", cy: "10.5", r: ".5", fill: "currentColor" }), _jsx("circle", { cx: "8.5", cy: "7.5", r: ".5", fill: "currentColor" }), _jsx("circle", { cx: "6.5", cy: "12.5", r: ".5", fill: "currentColor" }), _jsx("path", { d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" })] }));
/**
 * A glyph per built-in palette — the SVG shows in icon mode, the emoji in emoji
 * mode. Consumer-defined palettes (any name not below) fall back to the generic
 * palette glyph, so the picker never renders a bare label.
 */
const PALETTE_GLYPHS = {
    ocean: { icon: WavesGlyph, emoji: '🌊' },
    forest: { icon: TreeGlyph, emoji: '🌲' },
    sunset: { icon: SunsetGlyph, emoji: '🌅' },
    soft: { icon: CloudGlyph, emoji: '☁️' },
    dynamic: { icon: ZapGlyph, emoji: '⚡' },
};
const FALLBACK_PALETTE_GLYPH = { icon: PaletteGlyph, emoji: '🎨' };
/**
 * Renders a glyph that follows the app's display mode: the SVG `icon` normally,
 * the `emoji` once the consumer switches to emoji mode (`iconMode === 'emoji'`).
 * The icons↔emojis toggle is deliberately exempt — it shows both, side by side,
 * to demonstrate exactly what the switch does.
 */
function ModeGlyph({ icon, emoji, emojiMode }) {
    return emojiMode ? (_jsx("span", { className: "mrs-prefs__emoji", "aria-hidden": "true", children: emoji })) : (_jsx(_Fragment, { children: icon }));
}
function Segment({ active, onClick, children, }) {
    return (_jsx("button", { type: "button", className: "mrs-prefs__seg-btn", "aria-pressed": active, onClick: onClick, children: children }));
}
/**
 * <UserPreferences> — a drop-in user-options panel in a Radix dialog opened from an
 * icon button. Two built-in control groups: **theme** (palette + light/dark/system)
 * and **display** (an optional icons↔emojis switch + an optional menu-size control
 * that sizes the app-shell header chrome — small/medium/large). In the single-column
 * layout both groups stack; in the sectioned layout they are the reserved `'theme'` and `'display'` panes.
 *
 * Fully **controlled** — it reads the current values and emits an `onChange` for each
 * preference, and persists nothing itself, so the consumer decides where state lives
 * (localStorage via the shipped providers, or a per-user account / Convex). Auth-free:
 * surface sign-out / profile through the `accountActions` slot. Every label is a
 * **required, no-default prop** — pass translated strings via your t() seam, so the
 * kit never imports i18n and never renders a hardcoded language.
 */
export function UserPreferences({ theme, themes, onThemeChange, mode, onModeChange, followSystem, onFollowSystemChange, iconMode, onIconModeChange, menuSize, onMenuSizeChange, accountActions, trigger, triggerSize = 'md', open, onOpenChange, sections, activeSection, onActiveSectionChange, triggerLabel, title, description, themeHeading, modeHeading, displayHeading, lightLabel, darkLabel, systemLabel, iconsLabel, emojisLabel, menuSizeHeading, menuSizeSmallLabel, menuSizeMediumLabel, menuSizeLargeLabel, closeLabel, className, }) {
    const st = useShellText();
    const i18n = useI18nContextOptional();
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setOpen = (next) => {
        if (!isControlled)
            setInternalOpen(next);
        onOpenChange?.(next);
    };
    // Two-pane layout is engaged only when the consumer supplies sections. Absent
    // (or empty) → the single-column body below renders exactly as before.
    const sectioned = sections != null && sections.length > 0;
    // Active section is controlled-or-internal, mirroring `open`/`onOpenChange`.
    // Uncontrolled, it seeds to the first nav item and is NOT reset on open, so the
    // dialog reopens where the user left off within its lifetime. A consumer wanting
    // that to survive reloads passes `activeSection`/`onActiveSectionChange` and
    // persists it (e.g. sessionStorage). Whatever the source, a stale/absent id
    // resolves to the first nav item below.
    const [internalSection, setInternalSection] = useState(() => sections?.[0]?.id ?? 'theme');
    const activeControlled = activeSection !== undefined;
    const rawSection = activeControlled ? activeSection : internalSection;
    const activeId = sectioned && sections.some((s) => s.id === rawSection) ? rawSection : sections?.[0]?.id ?? 'theme';
    const setActiveSection = (id) => {
        if (!activeControlled)
            setInternalSection(id);
        onActiveSectionChange?.(id);
    };
    const showSystem = onFollowSystemChange !== undefined;
    const sys = followSystem === true;
    const showDisplay = iconMode !== undefined && onIconModeChange !== undefined;
    const showMenuSize = menuSize !== undefined && onMenuSizeChange !== undefined;
    // The modal's own glyphs follow the app's display mode when the consumer wires
    // the icons seam (passes `iconMode`); otherwise they stay icons.
    const emojiMode = iconMode === 'emoji';
    // The two built-in theme controls (palette + light/dark/system). In the
    // single-column layout they render inline; in the sectioned layout they are
    // the right pane shown while the built-in "Theme" nav item is active. The
    // display controls (icons↔emojis + menu size) live in their own `displayPane`
    // (reserved `'display'` section) so themes and visuals are separate sections.
    const themePane = (_jsxs(_Fragment, { children: [_jsxs("section", { className: "mrs-prefs__section", children: [_jsx("h3", { className: "mrs-prefs__heading", children: themeHeading }), _jsx("div", { className: "mrs-prefs__grid", role: "group", "aria-label": typeof themeHeading === 'string' ? themeHeading : undefined, children: themes.map((info) => {
                            const glyph = PALETTE_GLYPHS[info.name] ?? FALLBACK_PALETTE_GLYPH;
                            return (_jsxs("button", { type: "button", className: "mrs-prefs__option", "aria-pressed": theme === info.name, onClick: () => onThemeChange(info.name), children: [_jsx(ModeGlyph, { icon: glyph.icon, emoji: glyph.emoji, emojiMode: emojiMode }), info.label] }, info.name));
                        }) })] }), _jsxs("section", { className: "mrs-prefs__section", children: [_jsx("h3", { className: "mrs-prefs__heading", children: modeHeading }), _jsxs("div", { className: "mrs-prefs__seg", role: "group", "aria-label": typeof modeHeading === 'string' ? modeHeading : undefined, children: [_jsxs(Segment, { active: !sys && mode === 'light', onClick: () => onModeChange('light'), children: [_jsx(ModeGlyph, { icon: SunGlyph, emoji: "\u2600\uFE0F", emojiMode: emojiMode }), lightLabel] }), _jsxs(Segment, { active: !sys && mode === 'dark', onClick: () => onModeChange('dark'), children: [_jsx(ModeGlyph, { icon: MoonGlyph, emoji: "\uD83C\uDF19", emojiMode: emojiMode }), darkLabel] }), showSystem && (_jsxs(Segment, { active: sys, onClick: () => onFollowSystemChange(true), children: [_jsx(ModeGlyph, { icon: MonitorGlyph, emoji: "\uD83D\uDDA5\uFE0F", emojiMode: emojiMode }), systemLabel] }))] })] })] }));
    // The built-in display controls (reserved `'display'` section id): the
    // icons↔emojis switch and the menu-size (header-chrome size) control. Each
    // control renders only when the consumer wires it; the pane is empty (renders
    // nothing) if neither is wired.
    const displayPane = showDisplay || showMenuSize ? (_jsxs(_Fragment, { children: [showDisplay && (_jsxs("section", { className: "mrs-prefs__section", children: [_jsx("h3", { className: "mrs-prefs__heading", children: displayHeading }), _jsxs("div", { className: "mrs-prefs__seg", role: "group", "aria-label": typeof displayHeading === 'string' ? displayHeading : undefined, children: [_jsxs(Segment, { active: iconMode === 'emoji', onClick: () => onIconModeChange('emoji'), children: [_jsx("span", { className: "mrs-prefs__emoji", "aria-hidden": "true", children: "\uD83D\uDE00" }), emojisLabel] }), _jsxs(Segment, { active: iconMode === 'icon', onClick: () => onIconModeChange('icon'), children: [SmileGlyph, iconsLabel] })] })] })), showMenuSize && (_jsxs("section", { className: "mrs-prefs__section", children: [_jsx("h3", { className: "mrs-prefs__heading", children: menuSizeHeading ?? st('mrs.prefs.menuSizeHeading') }), _jsxs("div", { className: "mrs-prefs__seg", role: "group", "aria-label": typeof menuSizeHeading === 'string' ? menuSizeHeading : st('mrs.prefs.menuSizeHeading'), children: [_jsxs(Segment, { active: menuSize === 'small', onClick: () => onMenuSizeChange('small'), children: [_jsx(SizeGlyph, { size: 13 }), menuSizeSmallLabel ?? st('mrs.prefs.menuSizeSmall')] }), _jsxs(Segment, { active: menuSize === 'medium', onClick: () => onMenuSizeChange('medium'), children: [_jsx(SizeGlyph, { size: 16 }), menuSizeMediumLabel ?? st('mrs.prefs.menuSizeMedium')] }), _jsxs(Segment, { active: menuSize === 'large', onClick: () => onMenuSizeChange('large'), children: [_jsx(SizeGlyph, { size: 19 }), menuSizeLargeLabel ?? st('mrs.prefs.menuSizeLarge')] })] })] }))] })) : null;
    // The built-in language pane (reserved `'language'` section id). Driven off the
    // i18n seam read *softly* — present only when an `<I18nProvider>` is mounted, so
    // a consumer adds `{ id: 'language', … }` to `sections` and it just works with no
    // wiring, exactly like the palette pane. Inline option buttons (flag + native
    // name), mirroring the theme palette grid.
    const languagePane = i18n != null && i18n.locales.length > 0 ? (_jsxs("section", { className: "mrs-prefs__section", children: [_jsx("h3", { className: "mrs-prefs__heading", children: st('mrs.prefs.language') }), _jsx("div", { className: "mrs-prefs__grid", role: "group", "aria-label": st('mrs.prefs.language'), children: i18n.locales.map((l) => (_jsxs("button", { type: "button", className: "mrs-prefs__option", "aria-pressed": i18n.locale === l.code, onClick: () => i18n.setLocale(l.code), children: [_jsx(Flag, { code: l.code }), l.label] }, l.code))) })] })) : null;
    // The left-nav is exactly the sections the consumer passes, in order — the
    // built-in theme controls are just the entry whose id is `'theme'`.
    const navItems = sectioned ? sections : [];
    // The reserved `'theme'` / `'display'` / `'language'` ids render built-in panes;
    // every other id renders its section's own content. `activeId` is already guarded
    // to a present id.
    const activeContent = activeId === 'theme'
        ? themePane
        : activeId === 'display'
            ? displayPane
            : activeId === 'language'
                ? languagePane
                : sections?.find((s) => s.id === activeId)?.content ?? null;
    return (_jsxs(Dialog.Root, { open: isOpen, onOpenChange: setOpen, children: [_jsx(Dialog.Trigger, { asChild: true, children: trigger ?? (_jsx("button", { type: "button", className: "mrs-prefs-trigger", "data-size": triggerSize, "aria-label": triggerLabel, title: triggerLabel, children: _jsx(ModeGlyph, { icon: PaletteGlyph, emoji: "\uD83C\uDFA8", emojiMode: emojiMode }) })) }), _jsxs(Dialog.Portal, { children: [_jsx(Dialog.Overlay, { className: "mrs-dialog__overlay" }), _jsxs(Dialog.Content, { className: cn('mrs-prefs', sectioned && 'mrs-prefs--sectioned', className), children: [_jsxs("div", { className: "mrs-prefs__header", children: [_jsx(Dialog.Title, { className: "mrs-prefs__title", children: title }), _jsx(Dialog.Close, { className: "mrs-prefs__close", "aria-label": closeLabel ?? st('mrs.action.close'), children: _jsx(ModeGlyph, { icon: CloseGlyph, emoji: "\u274C", emojiMode: emojiMode }) })] }), description != null && (_jsx(Dialog.Description, { className: "mrs-prefs__desc", children: description })), sectioned ? (_jsxs("div", { className: "mrs-prefs__panes", children: [_jsx("nav", { className: "mrs-prefs__nav", "aria-label": typeof title === 'string' ? title : undefined, children: navItems.map((item) => {
                                            const active = item.id === activeId;
                                            return (_jsxs("button", { type: "button", className: "mrs-prefs__nav-item", "aria-pressed": active, "aria-current": active ? 'page' : undefined, onClick: () => setActiveSection(item.id), children: [_jsx("span", { className: "mrs-prefs__nav-icon", "aria-hidden": "true", children: item.icon }), _jsx("span", { className: "mrs-prefs__nav-label", children: item.label })] }, item.id));
                                        }) }), _jsx("div", { className: "mrs-prefs__content", children: activeContent })] })) : (_jsxs(_Fragment, { children: [themePane, displayPane] })), accountActions != null && _jsx("div", { className: "mrs-prefs__account", children: accountActions }), _jsx("div", { className: "mrs-prefs__footer", children: _jsx(Dialog.Close, { asChild: true, children: _jsx(Button, { variant: "soft", tone: "neutral", children: closeLabel ?? st('mrs.action.close') }) }) })] })] })] }));
}
