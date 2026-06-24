import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from './cn';
import { EMOJI_FREQUENT } from './EmojiPicker';
/**
 * `<EmojiBar>` — a compact row of quick-access emoji buttons. No search,
 * no categories — just a horizontal strip of clickable emojis. Compose it
 * next to a text input or a message composer for instant emoji reactions.
 *
 * ```tsx
 * // Default — shows EMOJI_FREQUENT (👍 ❤️ 😂 …):
 * <EmojiBar onSelect={(emoji) => insertEmoji(emoji)} />
 *
 * // Custom set:
 * <EmojiBar emojis={['🎉', '🔥', '💯', '✅']} onSelect={onSelect} />
 * ```
 */
export function EmojiBar({ emojis = EMOJI_FREQUENT, onSelect, className }) {
    return (_jsx("div", { className: cn('mrs-emoji-bar', className), children: emojis.map((emoji, i) => (_jsx("button", { type: "button", className: "mrs-emoji-bar__btn", onClick: () => onSelect(emoji), "aria-label": emoji, title: emoji, children: emoji }, `${emoji}-${i}`))) }));
}
