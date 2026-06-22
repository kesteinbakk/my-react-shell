/**
 * Shell contract — pure types for the app-shell module.
 *
 * The config shape an app passes to `defineShellConfig`, the page-entry tree the
 * three navigation layers + breadcrumb chain read, and the page-header options a
 * `usePageHeader` call registers onto shell context. No runtime, no React state —
 * just the contract. The icon library is externalized (`renderIcon`), and every
 * user-facing string is a thunk the consumer wires to its own `t()` — the module
 * never imports i18n.
 */
/**
 * Brand symbol — `Symbol.for` so HMR / multi-bundle duplication compares equal.
 * @internal never import this to forge a brand; go through `defineShellConfig`.
 */
export const SHELL_CONFIG_BRAND = Symbol.for('mrs.shell.config');
