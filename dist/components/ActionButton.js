import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn';
const actionButtonVariants = cva('mrs-action-btn', {
    variants: {
        tone: {
            neutral: 'mrs-action-btn--neutral',
            primary: 'mrs-action-btn--primary',
            success: 'mrs-action-btn--success',
            warning: 'mrs-action-btn--warning',
            danger: 'mrs-action-btn--danger',
            info: 'mrs-action-btn--info',
        },
        size: {
            xs: 'mrs-action-btn--xs',
            sm: 'mrs-action-btn--sm',
            md: 'mrs-action-btn--md',
            lg: 'mrs-action-btn--lg',
            xl: 'mrs-action-btn--xl',
        },
        layout: {
            vertical: 'mrs-action-btn--vertical',
            inline: 'mrs-action-btn--inline',
        },
        coloredLabel: { true: 'mrs-action-btn--colored-label' },
    },
    defaultVariants: { tone: 'neutral', size: 'sm', layout: 'vertical' },
});
/** Pixel glyph size per button size — keeps the emoji and the preset SVG in step. */
const ICON_PX = {
    xs: 16,
    sm: 20,
    md: 26,
    lg: 32,
    xl: 40,
};
/* ── Preset icons (hand-rolled, lucide-shaped — no icon dependency) ────────── */
const svgBase = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};
const renderStar = (px, filled) => (_jsx("svg", { width: px, height: px, ...svgBase, fill: filled ? 'currentColor' : 'none', children: _jsx("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }) }));
const PRESET_ICONS = {
    add: (px) => (_jsxs("svg", { width: px, height: px, ...svgBase, children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("path", { d: "M8 12h8" }), _jsx("path", { d: "M12 8v8" })] })),
    edit: (px) => (_jsxs("svg", { width: px, height: px, ...svgBase, children: [_jsx("path", { d: "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" }), _jsx("path", { d: "m15 5 4 4" })] })),
    delete: (px) => (_jsxs("svg", { width: px, height: px, ...svgBase, children: [_jsx("path", { d: "M3 6h18" }), _jsx("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }), _jsx("line", { x1: "10", x2: "10", y1: "11", y2: "17" }), _jsx("line", { x1: "14", x2: "14", y1: "11", y2: "17" })] })),
    copy: (px) => (_jsxs("svg", { width: px, height: px, ...svgBase, children: [_jsx("rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }), _jsx("path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" })] })),
    share: (px) => (_jsxs("svg", { width: px, height: px, ...svgBase, children: [_jsx("circle", { cx: "18", cy: "5", r: "3" }), _jsx("circle", { cx: "6", cy: "12", r: "3" }), _jsx("circle", { cx: "18", cy: "19", r: "3" }), _jsx("line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49" }), _jsx("line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49" })] })),
    download: (px) => (_jsxs("svg", { width: px, height: px, ...svgBase, children: [_jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }), _jsx("polyline", { points: "7 10 12 15 17 10" }), _jsx("line", { x1: "12", x2: "12", y1: "15", y2: "3" })] })),
    upload: (px) => (_jsxs("svg", { width: px, height: px, ...svgBase, children: [_jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }), _jsx("polyline", { points: "17 8 12 3 7 8" }), _jsx("line", { x1: "12", x2: "12", y1: "3", y2: "15" })] })),
    save: (px) => (_jsxs("svg", { width: px, height: px, ...svgBase, children: [_jsx("path", { d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }), _jsx("polyline", { points: "17 21 17 13 7 13 7 21" }), _jsx("polyline", { points: "7 3 7 8 15 8" })] })),
    search: (px) => (_jsxs("svg", { width: px, height: px, ...svgBase, children: [_jsx("circle", { cx: "11", cy: "11", r: "8" }), _jsx("path", { d: "m21 21-4.3-4.3" })] })),
    refresh: (px) => (_jsxs("svg", { width: px, height: px, ...svgBase, children: [_jsx("path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }), _jsx("path", { d: "M21 3v5h-5" }), _jsx("path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }), _jsx("path", { d: "M3 21v-5h5" })] })),
    settings: (px) => (_jsxs("svg", { width: px, height: px, ...svgBase, children: [_jsx("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }), _jsx("circle", { cx: "12", cy: "12", r: "3" })] })),
    star: (px) => renderStar(px, false),
    close: (px) => (_jsxs("svg", { width: px, height: px, ...svgBase, children: [_jsx("path", { d: "M18 6 6 18" }), _jsx("path", { d: "m6 6 12 12" })] })),
    more: (px) => (_jsxs("svg", { width: px, height: px, ...svgBase, children: [_jsx("circle", { cx: "12", cy: "12", r: "1" }), _jsx("circle", { cx: "19", cy: "12", r: "1" }), _jsx("circle", { cx: "5", cy: "12", r: "1" })] })),
};
/**
 * The shipped action presets: the "correct" glyph (SVG + emoji) and colour for each
 * common action. Override any of them per call. Presets carry **no text** — the kit
 * never renders a hardcoded language; pass a translated `label` (visible) and/or
 * `aria-label`/`hint` (accessible name) via your i18n seam.
 */
export const actionPresets = {
    add: { tone: 'success', emoji: '➕' },
    edit: { tone: 'info', emoji: '✏️' },
    delete: { tone: 'danger', emoji: '🗑️' },
    copy: { tone: 'neutral', emoji: '📋' },
    share: { tone: 'info', emoji: '🔗' },
    download: { tone: 'neutral', emoji: '⬇️' },
    upload: { tone: 'neutral', emoji: '⬆️' },
    save: { tone: 'primary', emoji: '💾' },
    search: { tone: 'neutral', emoji: '🔍' },
    refresh: { tone: 'neutral', emoji: '🔄' },
    settings: { tone: 'neutral', emoji: '⚙️' },
    star: { tone: 'warning', emoji: '⭐' },
    close: { tone: 'neutral', emoji: '❌' },
    more: { tone: 'neutral', emoji: '⋯' },
};
/* ── Component ────────────────────────────────────────────────────────────── */
/**
 * An opinionated icon/emoji + label action button on the semantic theme tokens.
 *
 * Use a **preset** for the common actions — each ships the correct glyph (SVG +
 * emoji) and colour. Presets carry **no text**; pass a translated `label` (visible)
 * and/or `aria-label`/`hint` (accessible name) yourself:
 * ```tsx
 * <ActionButton action="delete" aria-label={t('action.delete')} onClick={onDelete} />
 * <ActionButton action="add" label={t('action.add')} onClick={onAdd} />
 * <ActionButton action="star" active={fav} aria-label={t('action.favorite')} onClick={toggleFav} />
 * ```
 *
 * Or bring a **custom** glyph for anything else:
 * ```tsx
 * <ActionButton icon={<Download />} label={t('action.export')} tone="info" onClick={onExport} />
 * ```
 *
 * It never imports the i18n or icons modules: pass translated text via `label` /
 * `aria-label`, and wire `showEmoji={useIconMode().isEmoji}` to follow the
 * icons↔emojis seam. With no `label`/`aria-label`/`hint` the button is icon-only and
 * has **no accessible name** — supply one for any non-decorative action.
 */
export const ActionButton = forwardRef(function ActionButton(props, ref) {
    const { action, icon, emoji, active, onClick, label, showEmoji = false, hint, tone: toneProp, size = 'sm', layout = 'vertical', coloredLabel = false, disabled = false, type = 'button', 'aria-label': ariaLabelProp, className, ...rest } = props;
    const isStar = action === 'star';
    const preset = action != null ? actionPresets[action] : undefined;
    // Tone: explicit > preset > neutral. Star is special: amber when active,
    // neutral otherwise (with an amber hover, via the star-hover modifier).
    const tone = toneProp ?? (isStar ? (active ? 'warning' : 'neutral') : preset?.tone ?? 'neutral');
    const px = ICON_PX[size];
    const resolvedEmoji = emoji ?? preset?.emoji;
    // Glyph: emoji mode wins when an emoji is available; else a custom icon; else
    // the preset SVG (star honours its active fill); else the emoji as a fallback.
    let glyph = null;
    if (showEmoji && resolvedEmoji != null) {
        glyph = (_jsx("span", { className: "mrs-action-btn__emoji", style: { fontSize: px }, children: resolvedEmoji }));
    }
    else if (icon != null) {
        glyph = icon;
    }
    else if (isStar) {
        glyph = renderStar(px, !!active);
    }
    else if (action != null) {
        glyph = PRESET_ICONS[action](px);
    }
    else if (resolvedEmoji != null) {
        glyph = (_jsx("span", { className: "mrs-action-btn__emoji", style: { fontSize: px }, children: resolvedEmoji }));
    }
    const visibleLabel = label;
    const ariaLabel = ariaLabelProp ?? (visibleLabel != null ? undefined : hint);
    return (_jsxs("button", { ref: ref, type: type, onClick: onClick, disabled: disabled, title: hint, "aria-label": ariaLabel, "aria-pressed": isStar ? !!active : undefined, className: cn(actionButtonVariants({ tone, size, layout, coloredLabel: coloredLabel || undefined }), isStar && !active && 'mrs-action-btn--star-hover', className), ...rest, children: [glyph != null && (_jsx("span", { className: "mrs-action-btn__glyph", "aria-hidden": "true", children: glyph })), visibleLabel != null && _jsx("span", { className: "mrs-action-btn__label", children: visibleLabel })] }));
});
/** A flex container for a set of `ActionButton`s — a toolbar row (or column). */
export function ActionButtonGroup({ children, vertical = false, className }) {
    return (_jsx("div", { role: "group", className: cn('mrs-action-btn-group', vertical && 'mrs-action-btn-group--vertical', className), children: children }));
}
