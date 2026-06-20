import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * MissingTranslationsOverlay — dev-only surface for missing translation keys.
 *
 * Drop it once near the app root. While any key fails to resolve it shows a
 * fixed, warning-styled panel listing the misses (key + locale) with copy-keys
 * and clear actions, reading the module-level <missingKeyStore> via
 * `useSyncExternalStore`. Renders nothing in production (gated on
 * `import.meta.env.DEV`) or when nothing is missing. Styled with semantic theme
 * tokens only, so it tracks the active palette in light and dark.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { missingKeyStore } from './missingKeys';
const panelStyle = {
    position: 'fixed',
    bottom: 16,
    right: 16,
    zIndex: 2147483647,
    display: 'flex',
    flexDirection: 'column',
    width: 380,
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 320,
    overflow: 'hidden',
    borderRadius: 10,
    background: 'var(--color-surface-elevated)',
    color: 'var(--color-text-primary)',
    border: '2px solid var(--color-warning)',
    boxShadow: 'var(--color-shadow-lg)',
    font: '12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace',
};
const headerStyle = {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: '9px 12px',
    background: 'var(--color-warning-bg)',
    borderBottom: '1px solid var(--color-warning-border)',
    color: 'var(--color-warning-content)',
    fontWeight: 700,
};
const titleStyle = { display: 'flex', alignItems: 'center', gap: 8 };
const iconStyle = { fontSize: 15, lineHeight: 1 };
const actionsStyle = { display: 'flex', gap: 6 };
const buttonStyle = {
    cursor: 'pointer',
    padding: '3px 8px',
    borderRadius: 6,
    border: '1px solid var(--color-warning-border)',
    background: 'var(--color-surface-elevated)',
    color: 'var(--color-warning-content)',
    font: 'inherit',
    fontWeight: 600,
};
const bodyStyle = {
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'auto',
    padding: '8px 12px 10px',
    listStyle: 'none',
    margin: 0,
};
const itemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    padding: '2px 0',
};
const keyStyle = { color: 'var(--color-text-primary)' };
const localeStyle = { color: 'var(--color-text-muted)', flexShrink: 0 };
export function MissingTranslationsOverlay({ enabled } = {}) {
    const missing = useSyncExternalStore(missingKeyStore.subscribe, missingKeyStore.getSnapshot, missingKeyStore.getSnapshot);
    const [copied, setCopied] = useState(false);
    const resetTimer = useRef(null);
    useEffect(() => () => {
        if (resetTimer.current !== null)
            clearTimeout(resetTimer.current);
    }, []);
    const show = enabled ?? import.meta.env.DEV;
    if (!show || missing.length === 0)
        return null;
    const copyKeys = () => {
        // The distinct missing keys, sorted, one per line — paste-ready for the catalog.
        const text = Array.from(new Set(missing.map((m) => m.key)))
            .sort()
            .join('\n');
        if (!navigator.clipboard)
            return;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            if (resetTimer.current !== null)
                clearTimeout(resetTimer.current);
            resetTimer.current = setTimeout(() => setCopied(false), 1500);
        }, () => {
            /* clipboard blocked (insecure context / denied) — leave the label as-is */
        });
    };
    return (_jsxs("div", { style: panelStyle, role: "log", "aria-label": "Missing translations", children: [_jsxs("div", { style: headerStyle, children: [_jsxs("span", { style: titleStyle, children: [_jsx("span", { style: iconStyle, "aria-hidden": "true", children: "\u26A0\uFE0F" }), "Missing translations (", missing.length, ")"] }), _jsxs("span", { style: actionsStyle, children: [_jsx("button", { type: "button", style: buttonStyle, onClick: copyKeys, children: copied ? 'Copied!' : 'Copy keys' }), _jsx("button", { type: "button", style: buttonStyle, onClick: () => missingKeyStore.clear(), children: "Clear" })] })] }), _jsx("ul", { style: bodyStyle, children: missing.map((m) => (_jsxs("li", { style: itemStyle, children: [_jsx("span", { style: keyStyle, children: m.key }), _jsxs("span", { style: localeStyle, children: ["\u00B7 ", m.locale] })] }, `${m.key}@${m.locale}`))) })] }));
}
