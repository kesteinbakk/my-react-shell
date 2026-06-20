import { jsx as _jsx } from "react/jsx-runtime";
import { useIconModeContextOptional } from './iconModeContext';
const EMOJI_STYLE_BASE = {
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
};
export function Icon({ icon, emoji, size = 20, label, className }) {
    const ctx = useIconModeContextOptional();
    // Label present → announced (role=img); absent → decorative (aria-hidden).
    const role = label !== undefined ? 'img' : undefined;
    const ariaHidden = label === undefined ? true : undefined;
    if (ctx?.iconMode === 'emoji') {
        return (_jsx("span", { className: className, role: role, "aria-label": label, "aria-hidden": ariaHidden, style: { ...EMOJI_STYLE_BASE, fontSize: `${size}px` }, children: emoji }));
    }
    return (_jsx("span", { className: className, role: role, "aria-label": label, "aria-hidden": ariaHidden, style: { display: 'inline-flex' }, children: icon }));
}
