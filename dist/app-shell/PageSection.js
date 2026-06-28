import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useShellContextOptional } from './shellContext';
/**
 * A standalone component rendering a section card matching the App Shell's
 * PageSections card style. Hosts a header (optional icon + title + actions)
 * and a content body surface.
 */
export function PageSection({ title, icon, actions, className, type = 'card', children, }) {
    const shell = useShellContextOptional();
    const renderIcon = shell?.config.renderIcon;
    const resolvedIcon = typeof icon === 'string' && renderIcon ? renderIcon(icon, 18) : icon;
    const wrapperClass = type === 'card' ? 'mrs-section__card' : 'mrs-section__default';
    return (_jsxs("div", { className: `${wrapperClass}${className ? ` ${className}` : ''}`, children: [_jsxs("div", { className: "mrs-section__head", children: [resolvedIcon, typeof title === 'string' ? (_jsx("h3", { className: "mrs-section__title", children: title })) : (title), actions && actions.length > 0 && (_jsx("div", { className: "mrs-section__actions", children: actions.map((act, i) => (_jsx("span", { children: act }, i))) }))] }), _jsx("div", { className: "mrs-section__body", children: children })] }));
}
