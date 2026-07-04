import { jsx as _jsx } from "react/jsx-runtime";
import { SegmentedControl } from '../components';
import { useShellContextOptional } from './shellContext';
export function ShellPhaseControl({ variant }) {
    const shell = useShellContextOptional();
    const runtime = shell?.phase ?? null;
    const config = shell?.config.phase;
    if (runtime === null || config === undefined)
        return null;
    if (!runtime.visible)
        return null;
    // "Only one choice → don't show" — a single (or zero) available state has nothing
    // to switch between, so the control is omitted (the value is still readable).
    if (runtime.states.length < 2)
        return null;
    const options = runtime.states.map((state) => ({
        value: state,
        label: config.label(state),
    }));
    // Menu mode sits in a narrow sidebar column → stretch full-width at the small
    // size; header mode gets its natural width at the default size.
    const menu = variant === 'menu';
    return (_jsx("div", { className: `mrs-shell__phase mrs-shell__phase--${variant}`, "data-readonly": !runtime.selectable, children: _jsx(SegmentedControl, { options: options, value: runtime.phase, onChange: runtime.selectable ? runtime.setPhase : () => { }, "aria-label": config.ariaLabel?.(), size: menu ? 'sm' : 'md', fullWidth: menu }) }));
}
