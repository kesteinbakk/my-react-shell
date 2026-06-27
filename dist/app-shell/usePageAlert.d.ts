import type { PageHeaderAlertSpec } from './shellContract';
/**
 * usePageAlert — register a global page-level alert into the shell header band.
 *
 * If `hideOtherActions` is true, the renderer will hide any actions or search inputs
 * registered by `usePageHeader`.
 */
export declare function usePageAlert(spec: PageHeaderAlertSpec | null): void;
