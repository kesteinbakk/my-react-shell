import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn';
/**
 * Hover-reveal seam — two stacked layers that cross-fade. The `revealed` layer replaces
 * `closed` when the mark's nearest **`.mrs-reveal-host`** ancestor is hovered, or unconditionally
 * when `open` is `true`. Purely presentational (`aria-hidden`); it carries no semantics and is
 * meant to sit in a decorative slot such as a card watermark.
 *
 * The reveal is driven entirely by CSS — the host owns the hover, not the mark — so a mark works
 * inside any container that carries `mrs-reveal-host`. `DynamicCard` adds that class to its
 * root when given an element `watermark`, so a mark dropped there opens on card hover.
 *
 * {@link DrawerMark} is the first instance; build new marks the same way.
 */
export function RevealMark({ closed, revealed, open, className }) {
    return (_jsxs("span", { className: cn('mrs-reveal-mark', className), "data-open": open || undefined, "aria-hidden": "true", children: [_jsx("span", { className: "mrs-reveal-mark__layer mrs-reveal-mark__closed", children: closed }), _jsx("span", { className: "mrs-reveal-mark__layer mrs-reveal-mark__revealed", children: revealed })] }));
}
