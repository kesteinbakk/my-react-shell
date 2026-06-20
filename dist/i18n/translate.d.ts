/**
 * Translator core — pure, dependency-free.
 *
 * The i18n module ships its own tiny translator (flatten + `{{param}}`
 * interpolation + nested lookup) rather than wrapping a runtime i18n library,
 * so the module stays zero-dependency and the package barrel stays light. A
 * consumer who wants ICU / react-i18next / etc. plugs it in via the
 * `<I18nProvider resolve={…}>` override — see I18nProvider.
 */
/** Interpolation values for `{{param}}` placeholders. */
export type TranslateParams = Record<string, string | number>;
/** A nested message catalog: leaves are strings, branches are sub-catalogs. */
export interface Messages {
    [key: string]: string | Messages;
}
/** A catalog flattened to dotted-path keys (`a.b.c` → string). */
export type FlatMessages = Record<string, string>;
/**
 * The dotted-path string-literal union of a nested catalog type — the type-level
 * mirror of `flattenMessages`. `{ a: { b: 'x' }, c: 'y' }` → `'a.b' | 'c'`.
 *
 * Pure type; no runtime. A consumer with a nested catalog derives the key union
 * for `createTypedI18n` from the catalog itself:
 * `createTypedI18n<DotPaths<typeof en>>()`. A consumer that already keeps a flat
 * key union (e.g. evaluering's `DictKey`) passes that directly and never needs this.
 */
export type DotPaths<T> = T extends string ? never : {
    [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotPaths<T[K]>}`;
}[keyof T & string];
/**
 * Flatten a nested catalog into dotted-path keys.
 * `{ a: { b: 'x' } }` → `{ 'a.b': 'x' }`.
 */
export declare function flattenMessages(messages: Messages, prefix?: string): FlatMessages;
/**
 * Replace `{{param}}` placeholders with values. An unmatched placeholder is
 * left verbatim (a missing param is a content bug worth seeing, not hiding).
 */
export declare function interpolate(template: string, params?: TranslateParams): string;
/**
 * Deep-merge two catalogs; `override` wins on conflict. Useful for layering a
 * consumer's strings over a module's base catalog, or for BYO composition.
 * Pure — neither input is mutated.
 */
export declare function mergeMessages(base: Messages, override: Messages): Messages;
