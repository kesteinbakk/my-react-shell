import { cn } from './cn'
import { EMOJI_FREQUENT } from './EmojiPicker'

export interface EmojiBarProps {
  /**
   * Emoji characters to display as quick-access buttons. Defaults to
   * `EMOJI_FREQUENT` (12 common reaction emojis).
   */
  emojis?: readonly string[]
  /** Called when an emoji button is clicked; receives the emoji character. */
  onSelect: (emoji: string) => void
  /** Extra classes on the root element. */
  className?: string
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
export function EmojiBar({ emojis = EMOJI_FREQUENT, onSelect, className }: EmojiBarProps) {
  return (
    <div className={cn('mrs-emoji-bar', className)}>
      {emojis.map((emoji, i) => (
        <button
          key={`${emoji}-${i}`}
          type="button"
          className="mrs-emoji-bar__btn"
          onClick={() => onSelect(emoji)}
          aria-label={emoji}
          title={emoji}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
