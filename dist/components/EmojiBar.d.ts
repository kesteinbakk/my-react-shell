export interface EmojiBarProps {
    /**
     * Emoji characters to display as quick-access buttons. Defaults to
     * `EMOJI_FREQUENT` (12 common reaction emojis).
     */
    emojis?: readonly string[];
    /** Called when an emoji button is clicked; receives the emoji character. */
    onSelect: (emoji: string) => void;
    /** Extra classes on the root element. */
    className?: string;
}
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
export declare function EmojiBar({ emojis, onSelect, className }: EmojiBarProps): import("react").JSX.Element;
