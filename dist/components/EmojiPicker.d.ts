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
export declare function EmojiEmpty({ className }: {
    className?: string;
}): import("react").JSX.Element;
/** Default frequently-used emoji set — pass to `<EmojiBar emojis={EMOJI_FREQUENT}>`. */
export declare const EMOJI_FREQUENT: string[];
export interface EmojiPickerProps {
    /** Called when an emoji is selected; receives the emoji character string. */
    onSelect: (emoji: string) => void;
    /**
     * Locale for emoji labels and search (default `'en'`). Currently `'en'` and `'nb'`
     * are bundled; any other value falls back to `'en'`.
     */
    locale?: string;
    /** Show the search input. Default `true`. */
    showSearch?: boolean;
    /** Placeholder text for the search field. Defaults to the built-in `mrs.action.search`. */
    searchPlaceholder?: string;
    /** Label shown when search returns no results. Defaults to the built-in `mrs.state.noResults`. */
    noResultsLabel?: string;
    /** Accessible label for the category tablist. Defaults to the built-in `mrs.emoji.categories`. */
    categoriesLabel?: string;
    /** Accessible label + tooltip for the frequently-used tab. Defaults to the built-in `mrs.emoji.frequent`. */
    frequentLabel?: string;
    /** Extra classes on the root element. */
    className?: string;
}
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
 * ```
 */
export declare function EmojiPicker({ onSelect, locale, showSearch, searchPlaceholder, noResultsLabel, categoriesLabel, frequentLabel, className, }: EmojiPickerProps): import("react").JSX.Element;
