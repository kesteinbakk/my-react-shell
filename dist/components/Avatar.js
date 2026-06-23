import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Children, useState } from 'react';
import { cn } from './cn';
const svgBase = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};
const FALLBACK_ICON_PX = { sm: 16, md: 20, lg: 28 };
function PersonIcon({ px }) {
    return (_jsxs("svg", { width: px, height: px, ...svgBase, "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "8", r: "4" }), _jsx("path", { d: "M4 20c0-4 3.58-7 8-7s8 3 8 7" })] }));
}
/** Avatar — image with an initials / text fallback (on image error too). */
export function Avatar({ src, alt = '', fallback, size = 'md', showEmoji = false, className }) {
    const [errored, setErrored] = useState(false);
    const showImage = src != null && src !== '' && !errored;
    const resolvedFallback = fallback != null ? fallback : showEmoji ? (_jsx("span", { "aria-hidden": "true", style: { fontSize: FALLBACK_ICON_PX[size] }, children: "\uD83D\uDC64" })) : (_jsx(PersonIcon, { px: FALLBACK_ICON_PX[size] }));
    return (_jsx("span", { className: cn('mrs-avatar', `mrs-avatar--${size}`, className), children: showImage ? (_jsx("img", { className: "mrs-avatar__img", src: src, alt: alt, onError: () => setErrored(true) })) : (_jsx("span", { className: "mrs-avatar__fallback", children: resolvedFallback })) }));
}
/** Overlapping stack of avatars with an optional `+N` overflow badge. */
export function AvatarGroup({ children, max, className }) {
    const items = Children.toArray(children);
    const shown = max != null ? items.slice(0, max) : items;
    const overflow = items.length - shown.length;
    return (_jsxs("div", { className: cn('mrs-avatar-group', className), children: [shown, overflow > 0 && (_jsx("span", { className: "mrs-avatar mrs-avatar--md mrs-avatar-group__more", children: _jsxs("span", { className: "mrs-avatar__fallback", children: ["+", overflow] }) }))] }));
}
