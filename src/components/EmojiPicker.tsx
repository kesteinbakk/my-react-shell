import { useState, useEffect, useMemo, useCallback } from 'react'
import { cn } from './cn'
import { SectionSpinner } from './Spinner'
import { Input } from './Input'
import { useShellText } from './useShellText'
import { CloseGlyph } from './CloseGlyph'

// ── Internal types ────────────────────────────────────────────────────────

interface CompactEmoji {
  hexcode: string
  label: string
  unicode: string
  group?: number
  order?: number
  tags?: string[]
  emoticon?: string | string[]
}

interface EmojiGroup {
  key: string
  message: string
  order: number
}

// ── Module-level caches (survive re-mounts) ───────────────────────────────

const dataCache = new Map<string, CompactEmoji[]>()
const groupsCache = new Map<string, EmojiGroup[]>()

async function loadData(locale: string): Promise<CompactEmoji[]> {
  if (dataCache.has(locale)) return dataCache.get(locale)!
  let raw: unknown[]
  if (locale === 'nb') {
    raw = ((await import('emojibase-data/nb/compact.json')) as { default: unknown[] }).default
  } else {
    raw = ((await import('emojibase-data/en/compact.json')) as { default: unknown[] }).default
  }
  const filtered = (raw as CompactEmoji[]).filter((e) => e.group !== undefined)
  dataCache.set(locale, filtered)
  return filtered
}

async function loadGroups(locale: string): Promise<EmojiGroup[]> {
  if (groupsCache.has(locale)) return groupsCache.get(locale)!
  let messages: { groups: EmojiGroup[] }
  if (locale === 'nb') {
    messages = (
      (await import('emojibase-data/nb/messages.json')) as { default: { groups: EmojiGroup[] } }
    ).default
  } else {
    messages = (
      (await import('emojibase-data/en/messages.json')) as { default: { groups: EmojiGroup[] } }
    ).default
  }
  const groups = messages.groups
    .filter((g) => g.key !== 'component')
    .sort((a, b) => a.order - b.order)
  groupsCache.set(locale, groups)
  return groups
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
export function EmojiEmpty({ className }: { className?: string }) {
  return <span className={cn('mrs-emoji-empty', className)}>+</span>
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
]

const GROUP_ICONS: Record<string, string> = {
  'smileys-emotion': '😀',
  'people-body': '👋',
  'animals-nature': '🐱',
  'food-drink': '🍕',
  'travel-places': '✈️',
  activities: '⚽',
  objects: '💡',
  symbols: '❤️',
  flags: '🏳️',
}

const FREQUENT_TAB = '__frequent__'

// ── Props ──────────────────────────────────────────────────────────────────

export interface EmojiPickerProps {
  /** Called when an emoji is selected; receives the emoji character string. */
  onSelect: (emoji: string) => void
  /**
   * Locale for emoji labels and search (default `'en'`). Currently `'en'` and `'nb'`
   * are bundled; any other value falls back to `'en'`.
   */
  locale?: string
  /** Show the search input. Default `true`. */
  showSearch?: boolean
  /** Placeholder text for the search field. Defaults to the built-in `mrs.action.search`. */
  searchPlaceholder?: string
  /**
   * Called when the clear button is clicked — use it to set your selected-emoji
   * value back to `undefined`. Omit to hide the clear button (default: hidden).
   */
  onClear?: () => void
  /** Accessible label + tooltip for the clear button. Defaults to the built-in `mrs.action.clear`. */
  clearLabel?: string
  /** Label shown when search returns no results. Defaults to the built-in `mrs.state.noResults`. */
  noResultsLabel?: string
  /** Accessible label for the category tablist. Defaults to the built-in `mrs.emoji.categories`. */
  categoriesLabel?: string
  /** Accessible label + tooltip for the frequently-used tab. Defaults to the built-in `mrs.emoji.frequent`. */
  frequentLabel?: string
  /** Extra classes on the root element. */
  className?: string
}

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
export function EmojiPicker({
  onSelect,
  locale = 'en',
  showSearch = true,
  searchPlaceholder,
  onClear,
  clearLabel,
  noResultsLabel,
  categoriesLabel,
  frequentLabel,
  className,
}: EmojiPickerProps) {
  const st = useShellText()
  const searchText = searchPlaceholder ?? st('mrs.action.search')
  const clearText = clearLabel ?? st('mrs.action.clear')
  const noResultsText = noResultsLabel ?? st('mrs.state.noResults')
  const categoriesText = categoriesLabel ?? st('mrs.emoji.categories')
  const frequentText = frequentLabel ?? st('mrs.emoji.frequent')
  const [data, setData] = useState<CompactEmoji[]>([])
  const [groups, setGroups] = useState<EmojiGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState(FREQUENT_TAB)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([loadData(locale), loadGroups(locale)]).then(([d, g]) => {
      if (cancelled) return
      setData(d)
      setGroups(g)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  const groupedEmojis = useMemo(() => {
    const map = new Map<number, CompactEmoji[]>()
    for (const emoji of data) {
      if (emoji.group === undefined) continue
      const arr = map.get(emoji.group)
      if (arr) {
        arr.push(emoji)
      } else {
        map.set(emoji.group, [emoji])
      }
    }
    for (const [, arr] of map) arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    return map
  }, [data])

  const searchResults = useMemo<CompactEmoji[] | null>(() => {
    const q = query.trim().toLowerCase()
    if (!q || !data.length) return null
    const out: CompactEmoji[] = []
    for (const emoji of data) {
      if (out.length >= 50) break
      if (emoji.label.toLowerCase().includes(q)) {
        out.push(emoji)
        continue
      }
      if (emoji.tags?.some((t) => t.toLowerCase().includes(q))) {
        out.push(emoji)
        continue
      }
      const emoticon = emoji.emoticon
      if (emoticon) {
        const arr = Array.isArray(emoticon) ? emoticon : [emoticon]
        if (arr.some((e) => e.toLowerCase().includes(q))) out.push(emoji)
      }
    }
    return out
  }, [query, data])

  const isSearchMode = searchResults !== null

  const currentEmojis = useMemo((): CompactEmoji[] => {
    if (isSearchMode) return searchResults!
    if (activeTab === FREQUENT_TAB) {
      return EMOJI_FREQUENT.map((unicode) => ({ hexcode: '', label: '', unicode }))
    }
    const group = groups.find((g) => g.key === activeTab)
    if (!group) return []
    return groupedEmojis.get(group.order) ?? []
  }, [isSearchMode, searchResults, activeTab, groups, groupedEmojis])

  const handleSelect = useCallback(
    (unicode: string) => {
      onSelect(unicode)
      setQuery('')
    },
    [onSelect],
  )

  return (
    <div className={cn('mrs-emoji-picker', className)}>
      {(showSearch || onClear) && (
        <div className="mrs-emoji-picker__search">
          {showSearch && (
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchText}
              inputSize="sm"
              aria-label={searchText}
            />
          )}
          {onClear && (
            <button
              type="button"
              className="mrs-emoji-picker__clear"
              onClick={onClear}
              aria-label={clearText}
              title={clearText}
            >
              <CloseGlyph />
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="mrs-emoji-picker__loading">
          <SectionSpinner />
        </div>
      ) : (
        <>
          {!isSearchMode && (
            <div
              className="mrs-emoji-picker__tabs"
              role="tablist"
              aria-label={categoriesText}
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === FREQUENT_TAB}
                aria-label={frequentText}
                title={frequentText}
                className={cn(
                  'mrs-emoji-picker__tab',
                  activeTab === FREQUENT_TAB && 'mrs-emoji-picker__tab--active',
                )}
                onClick={() => setActiveTab(FREQUENT_TAB)}
              >
                ⏱️
              </button>
              {groups.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === g.key}
                  aria-label={g.message}
                  title={g.message}
                  className={cn(
                    'mrs-emoji-picker__tab',
                    activeTab === g.key && 'mrs-emoji-picker__tab--active',
                  )}
                  onClick={() => setActiveTab(g.key)}
                >
                  {GROUP_ICONS[g.key] ?? '📦'}
                </button>
              ))}
            </div>
          )}

          <div className="mrs-emoji-picker__body">
            {isSearchMode && currentEmojis.length === 0 ? (
              <div className="mrs-emoji-picker__empty">{noResultsText}</div>
            ) : (
              <div className="mrs-emoji-picker__grid">
                {currentEmojis.map((emoji, i) => (
                  <button
                    key={`${emoji.unicode}-${i}`}
                    type="button"
                    className="mrs-emoji-picker__btn"
                    onClick={() => handleSelect(emoji.unicode)}
                    title={emoji.label || emoji.unicode}
                    aria-label={emoji.label || emoji.unicode}
                  >
                    {emoji.unicode}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
