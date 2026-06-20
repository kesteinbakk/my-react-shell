import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Children, useState } from 'react';
import { cn } from './cn';
/** Avatar — image with an initials / text fallback (on image error too). */
export function Avatar({ src, alt = '', fallback, size = 'md', className }) {
    const [errored, setErrored] = useState(false);
    const showImage = src != null && src !== '' && !errored;
    return (_jsx("span", { className: cn('mrs-avatar', `mrs-avatar--${size}`, className), children: showImage ? (_jsx("img", { className: "mrs-avatar__img", src: src, alt: alt, onError: () => setErrored(true) })) : (_jsx("span", { className: "mrs-avatar__fallback", children: fallback })) }));
}
/** Overlapping stack of avatars with an optional `+N` overflow badge. */
export function AvatarGroup({ children, max, className }) {
    const items = Children.toArray(children);
    const shown = max != null ? items.slice(0, max) : items;
    const overflow = items.length - shown.length;
    return (_jsxs("div", { className: cn('mrs-avatar-group', className), children: [shown, overflow > 0 && (_jsx("span", { className: "mrs-avatar mrs-avatar--md mrs-avatar-group__more", children: _jsxs("span", { className: "mrs-avatar__fallback", children: ["+", overflow] }) }))] }));
}
