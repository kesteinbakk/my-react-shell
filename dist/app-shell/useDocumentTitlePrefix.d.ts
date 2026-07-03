/**
 * useDocumentTitlePrefix — set a plain-string prefix prepended to `document.title`.
 *
 * The app-shell is the single owner of `document.title` (it recomposes and rewrites
 * it on every navigation / title change), so any direct write from a component is
 * clobbered on the next recompute. This hook is the ONLY safe seam for a prefix:
 * it flows the string through the shell's own title composition, which renders
 * `"{prefix} {composedTitle}"` (single space) and re-applies it on every recompute.
 *
 * Intended for an unread-badge style marker (e.g. `"(3)"`). Pass `null` or an empty
 * string for no prefix. The prefix is cleared automatically on unmount.
 *
 * This is a single reactive slot with exactly one intended producer — not a
 * register/unregister stack. If two components set a prefix, last-write-wins.
 */
export declare function useDocumentTitlePrefix(prefix: string | null): void;
