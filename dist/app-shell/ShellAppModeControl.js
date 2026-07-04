import { jsx as _jsx } from "react/jsx-runtime";
import { SegmentedControl } from '../components';
import { useShellContextOptional } from './shellContext';
export function ShellAppModeControl({ variant }) {
    const shell = useShellContextOptional();
    const runtime = shell?.appMode ?? null;
    const config = shell?.config.appMode;
    if (runtime === null || config === undefined)
        return null;
    if (!runtime.visible)
        return null;
    // "Only one choice → don't show" — a single (or zero) available mode has nothing
    // to switch between, so the control is omitted (the value is still readable).
    if (runtime.modes.length < 2)
        return null;
    const options = runtime.modes.map((mode) => ({
        value: mode,
        label: config.label(mode),
    }));
    // Menu mode sits in a narrow sidebar column → stretch full-width at the small
    // size; header mode gets its natural width at the default size.
    const menu = variant === 'menu';
    return (_jsx("div", { className: `mrs-shell__app-mode mrs-shell__app-mode--${variant}`, "data-readonly": !runtime.selectable, children: _jsx(SegmentedControl, { options: options, value: runtime.appMode, onChange: runtime.selectable ? runtime.setAppMode : () => { }, "aria-label": config.ariaLabel?.(), size: menu ? 'sm' : 'md', fullWidth: menu }) }));
}
