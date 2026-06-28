import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn';
import { RevealMark } from './RevealMark';
/**
 * Closed drawer — a solid isometric box with a knob.
 */
function ClosedDrawer() {
    return (_jsxs("svg", { className: "mrs-drawer-mark__art", viewBox: "0 0 150 128", "aria-hidden": "true", children: [_jsx("polygon", { className: "mrs-drawer-mark__side mrs-drawer-mark__edge", points: "18,46 70,72 70,106 18,80" }), _jsx("polygon", { className: "mrs-drawer-mark__top mrs-drawer-mark__edge", points: "70,20 122,46 70,72 18,46" }), _jsx("polygon", { className: "mrs-drawer-mark__front mrs-drawer-mark__edge", points: "70,72 122,46 122,80 70,106" }), _jsx("circle", { className: "mrs-drawer-mark__knob", cx: "96", cy: "76", r: "3" })] }));
}
/**
 * Open drawer — the same box with its tray pulled out: a dark slot, gray inner walls and floor,
 * and one sheet lying flat inside.
 */
function OpenDrawer() {
    return (_jsxs("svg", { className: "mrs-drawer-mark__art", viewBox: "0 0 150 128", "aria-hidden": "true", children: [_jsx("polygon", { className: "mrs-drawer-mark__top mrs-drawer-mark__edge", points: "70,20 122,46 70,72 18,46" }), _jsx("polygon", { className: "mrs-drawer-mark__side mrs-drawer-mark__edge", points: "18,46 70,72 70,106 18,80" }), _jsx("polygon", { className: "mrs-drawer-mark__slot", points: "70,72 122,46 122,80 70,106" }), _jsx("polygon", { className: "mrs-drawer-mark__wall mrs-drawer-mark__edge", points: "72,72 120,48 120,57 72,81" }), _jsx("polygon", { className: "mrs-drawer-mark__wall mrs-drawer-mark__edge", points: "120,48 146,61 146,70 120,57" }), _jsx("polygon", { className: "mrs-drawer-mark__floor mrs-drawer-mark__edge", points: "72,81 120,57 146,70 98,94" }), _jsx("polygon", { className: "mrs-drawer-mark__sheet mrs-drawer-mark__edge", points: "86,79 116,64 132,72 102,87" }), _jsx("line", { className: "mrs-drawer-mark__line", x1: "100", y1: "76", x2: "118", y2: "71" }), _jsx("line", { className: "mrs-drawer-mark__line", x1: "103", y1: "80", x2: "121", y2: "75" }), _jsx("polygon", { className: "mrs-drawer-mark__side mrs-drawer-mark__edge", points: "98,85 72,72 72,99 98,112" }), _jsx("polygon", { className: "mrs-drawer-mark__front mrs-drawer-mark__edge", points: "98,85 146,61 146,88 98,112" }), _jsx("circle", { className: "mrs-drawer-mark__knob", cx: "122", cy: "86", r: "3" })] }));
}
/**
 * Drawer mark — an isometric drawer box that rests closed and slides open on hover, built on the
 * {@link RevealMark} seam. Drop it into a card's `watermark` slot: it renders faint behind the
 * content and opens when the card is hovered, or stays open when `open` is set (active route).
 *
 * Fully theme-token-driven (surfaces, borders, text) — the gray interior comes from a
 * `color-mix` of `--color-text-primary` into the surface, so it inverts naturally between light
 * and dark mode. Decorative only (`aria-hidden`); pass real labels through the card's `title`.
 */
export function DrawerMark({ open, className }) {
    return (_jsx(RevealMark, { open: open, className: cn('mrs-drawer-mark', className), closed: _jsx(ClosedDrawer, {}), revealed: _jsx(OpenDrawer, {}) }));
}
