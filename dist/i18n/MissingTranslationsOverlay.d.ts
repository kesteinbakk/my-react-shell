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
export interface MissingTranslationsOverlayProps {
    /** Force the overlay on/off. Defaults to `import.meta.env.DEV` (dev only). */
    enabled?: boolean;
}
export declare function MissingTranslationsOverlay({ enabled }?: MissingTranslationsOverlayProps): import("react").JSX.Element | null;
