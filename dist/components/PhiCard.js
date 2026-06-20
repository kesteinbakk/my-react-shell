import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn';
/**
 * φ — the golden ratio. Exported so a consumer can size a layout against the exact
 * constant the card uses (a card's rendered height is `width / PHI`).
 *
 * The card is one scaling unit driven entirely by its width:
 *   Outer:      width : height  = φ : 1
 *   Bands:      upperH : lowerH  = φ : 1   (horizontal split)
 *   Upper band: leftW  : rightW  = 1 : φ   (narrow logo · wide title)
 *   Lower band: leftW  : rightW  = φ : 1   (wide footer · narrow badge)
 *
 * The internal splits live in components.css as `fr` ratios; the `1.6180339887fr`
 * literals there are this same φ, kept in lockstep with this constant.
 */
export const PHI = 1.6180339887;
const SIZE_WIDTH_PX = {
    sm: 180,
    md: 240,
    lg: 320,
    xl: 480,
};
function SlotCell({ children, align, overflowX, divider }) {
    return (_jsx("div", { className: cn('mrs-phi-card__cell', `mrs-phi-card__cell--${align}`, overflowX ? 'mrs-phi-card__cell--overflow-x' : 'mrs-phi-card__cell--clip', divider && 'mrs-phi-card__cell--divider'), children: children }));
}
/**
 * Golden-ratio–locked card with four fixed slots and φ-proportioned bands. Width is
 * the only size knob — height and every slot size derive from it. See the components
 * guide for the slot map and examples.
 */
export function PhiCard({ size = 'md', upperLeft, upperRight, lowerLeft, lowerRight, leftBorderColor, onClick, hoverable, className, dividers = false, centerContent = false, singleBand = false, }) {
    const width = SIZE_WIDTH_PX[size];
    const height = width / PHI;
    const isHoverable = hoverable ?? !!onClick;
    const hasUpperLeft = !!upperLeft;
    const style = {
        width: `${width}px`,
        height: `${height}px`,
        ...(leftBorderColor ? { borderLeft: `3px solid ${leftBorderColor}` } : {}),
    };
    return (_jsxs("div", { className: cn('mrs-phi-card', singleBand && 'mrs-phi-card--single', isHoverable && 'mrs-phi-card--hoverable', className), style: style, onClick: onClick, children: [_jsxs("div", { className: cn('mrs-phi-card__band', hasUpperLeft ? 'mrs-phi-card__band--upper' : 'mrs-phi-card__band--upper-full'), children: [hasUpperLeft ? (_jsx(SlotCell, { align: "center", divider: dividers, children: upperLeft })) : null, _jsx(SlotCell, { align: centerContent ? 'center' : 'center-y', children: upperRight })] }), !singleBand ? (_jsxs("div", { className: cn('mrs-phi-card__band', 'mrs-phi-card__band--lower', dividers && 'mrs-phi-card__band--divider-top'), children: [_jsx(SlotCell, { align: centerContent ? 'center' : 'start', overflowX: true, divider: dividers, children: lowerLeft }), _jsx(SlotCell, { align: centerContent ? 'center' : 'end', children: lowerRight })] })) : null] }));
}
