import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from './cn';
import { SectionSpinner } from './Spinner';
import { Input } from './Input';
import { useShellText } from './useShellText';
import { CloseGlyph } from './CloseGlyph';
// ── Module-level caches (survive re-mounts) ───────────────────────────────
const dataCache = new Map();
const groupsCache = new Map();
async function loadData(locale) {
    if (dataCache.has(locale))
        return dataCache.get(locale);
    let raw;
    if (locale === 'nb') {
        raw = (await import('emojibase-data/nb/compact.json')).default;
    }
    else {
        raw = (await import('emojibase-data/en/compact.json')).default;
    }
    const filtered = raw.filter((e) => e.group !== undefined);
    dataCache.set(locale, filtered);
    return filtered;
}
async function loadGroups(locale) {
    if (groupsCache.has(locale))
        return groupsCache.get(locale);
    let messages;
    if (locale === 'nb') {
        messages = (await import('emojibase-data/nb/messages.json')).default;
    }
    else {
        messages = (await import('emojibase-data/en/messages.json')).default;
    }
    const groups = messages.groups
        .filter((g) => g.key !== 'component')
        .sort((a, b) => a.order - b.order);
    groupsCache.set(locale, groups);
    return groups;
}
// ── Constants ─────────────────────────────────────────────────────────────
/**
 * `<EmojiEmpty>` — a muted rounded box with a `+` centre, sized to one emoji slot.
 * Use as the unset-value placeholder in any trigger or display that shows a selected
 * emoji — visually distinct from real emoji content so the empty state is never
 * mistaken for a selection.
 *
 * ```tsx
 * <button onClick={openPicker}>
 *   {value ? <span>{value}</span> : <EmojiEmpty />}
 * </button>
 * ```
 */
export function EmojiEmpty({ className }) {
    return _jsx("span", { className: cn('mrs-emoji-empty', className), children: "+" });
}
/** Default frequently-used emoji set — pass to `<EmojiBar emojis={EMOJI_FREQUENT}>`. */
export const EMOJI_FREQUENT = [
    '👍',
    '❤️',
    '😂',
    '😮',
    '😢',
    '😡',
    '🎉',
    '👏',
    '🔥',
    '💯',
    '✨',
    '🙏',
];
const GROUP_ICONS = {
    'smileys-emotion': '😀',
    'people-body': '👋',
    'animals-nature': '🐱',
    'food-drink': '🍕',
    'travel-places': '✈️',
    activities: '⚽',
    objects: '💡',
    symbols: '❤️',
    flags: '🏳️',
};
const FREQUENT_TAB = '__frequent__';
// ── Component ──────────────────────────────────────────────────────────────
/**
 * `<EmojiPicker>` — a full emoji picker panel: search, category tabs (with a
 * frequently-used tab), and an 8-column emoji grid. Ships no popover or trigger
 * of its own — embed it inline or drop it into a `<Popover>`.
 *
 * Requires the `emojibase-data` optional peer (`pnpm add emojibase-data`).
 * Currently bundles `en` and `nb` locale data; any other `locale` value falls
 * back to `en`.
 *
 * ```tsx
 * // Inline:
 * <EmojiPicker onSelect={setEmoji} />
 *
 * // Behind a popover trigger:
 * <Popover trigger={<Button>Pick emoji</Button>}>
 *   <EmojiPicker onSelect={(emoji) => { setEmoji(emoji); setOpen(false) }} />
 * </Popover>
 *
 * // With a clear button (sets the value back to undefined):
 * <EmojiPicker onSelect={setEmoji} onClear={() => setEmoji(undefined)} />
 * ```
 */
export function EmojiPicker({ onSelect, locale = 'en', showSearch = true, searchPlaceholder, onClear, clearLabel, noResultsLabel, categoriesLabel, frequentLabel, className, }) {
    const st = useShellText();
    const searchText = searchPlaceholder ?? st('mrs.action.search');
    const clearText = clearLabel ?? st('mrs.action.clear');
    const noResultsText = noResultsLabel ?? st('mrs.state.noResults');
    const categoriesText = categoriesLabel ?? st('mrs.emoji.categories');
    const frequentText = frequentLabel ?? st('mrs.emoji.frequent');
    const [data, setData] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState(FREQUENT_TAB);
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        Promise.all([loadData(locale), loadGroups(locale)]).then(([d, g]) => {
            if (cancelled)
                return;
            setData(d);
            setGroups(g);
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [locale]);
    const groupedEmojis = useMemo(() => {
        const map = new Map();
        for (const emoji of data) {
            if (emoji.group === undefined)
                continue;
            const arr = map.get(emoji.group);
            if (arr) {
                arr.push(emoji);
            }
            else {
                map.set(emoji.group, [emoji]);
            }
        }
        for (const [, arr] of map)
            arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return map;
    }, [data]);
    const searchResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q || !data.length)
            return null;
        const out = [];
        for (const emoji of data) {
            if (out.length >= 50)
                break;
            if (emoji.label.toLowerCase().includes(q)) {
                out.push(emoji);
                continue;
            }
            if (emoji.tags?.some((t) => t.toLowerCase().includes(q))) {
                out.push(emoji);
                continue;
            }
            const emoticon = emoji.emoticon;
            if (emoticon) {
                const arr = Array.isArray(emoticon) ? emoticon : [emoticon];
                if (arr.some((e) => e.toLowerCase().includes(q)))
                    out.push(emoji);
            }
        }
        return out;
    }, [query, data]);
    const isSearchMode = searchResults !== null;
    const currentEmojis = useMemo(() => {
        if (isSearchMode)
            return searchResults;
        if (activeTab === FREQUENT_TAB) {
            return EMOJI_FREQUENT.map((unicode) => ({ hexcode: '', label: '', unicode }));
        }
        const group = groups.find((g) => g.key === activeTab);
        if (!group)
            return [];
        return groupedEmojis.get(group.order) ?? [];
    }, [isSearchMode, searchResults, activeTab, groups, groupedEmojis]);
    const handleSelect = useCallback((unicode) => {
        onSelect(unicode);
        setQuery('');
    }, [onSelect]);
    return (_jsxs("div", { className: cn('mrs-emoji-picker', className), children: [(showSearch || onClear) && (_jsxs("div", { className: "mrs-emoji-picker__search", children: [showSearch && (_jsx(Input, { value: query, onChange: (e) => setQuery(e.target.value), placeholder: searchText, inputSize: "sm", "aria-label": searchText })), onClear && (_jsx("button", { type: "button", className: "mrs-emoji-picker__clear", onClick: onClear, "aria-label": clearText, title: clearText, children: _jsx(CloseGlyph, {}) }))] })), loading ? (_jsx("div", { className: "mrs-emoji-picker__loading", children: _jsx(SectionSpinner, {}) })) : (_jsxs(_Fragment, { children: [!isSearchMode && (_jsxs("div", { className: "mrs-emoji-picker__tabs", role: "tablist", "aria-label": categoriesText, children: [_jsx("button", { type: "button", role: "tab", "aria-selected": activeTab === FREQUENT_TAB, "aria-label": frequentText, title: frequentText, className: cn('mrs-emoji-picker__tab', activeTab === FREQUENT_TAB && 'mrs-emoji-picker__tab--active'), onClick: () => setActiveTab(FREQUENT_TAB), children: "\u23F1\uFE0F" }), groups.map((g) => (_jsx("button", { type: "button", role: "tab", "aria-selected": activeTab === g.key, "aria-label": g.message, title: g.message, className: cn('mrs-emoji-picker__tab', activeTab === g.key && 'mrs-emoji-picker__tab--active'), onClick: () => setActiveTab(g.key), children: GROUP_ICONS[g.key] ?? '📦' }, g.key)))] })), _jsx("div", { className: "mrs-emoji-picker__body", children: isSearchMode && currentEmojis.length === 0 ? (_jsx("div", { className: "mrs-emoji-picker__empty", children: noResultsText })) : (_jsx("div", { className: "mrs-emoji-picker__grid", children: currentEmojis.map((emoji, i) => (_jsx("button", { type: "button", className: "mrs-emoji-picker__btn", onClick: () => handleSelect(emoji.unicode), title: emoji.label || emoji.unicode, "aria-label": emoji.label || emoji.unicode, children: emoji.unicode }, `${emoji.unicode}-${i}`))) })) })] }))] }));
}
