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
export type TranslateParams = Record<string, string | number>

/** A nested message catalog: leaves are strings, branches are sub-catalogs. */
export interface Messages {
  [key: string]: string | Messages
}

/** A catalog flattened to dotted-path keys (`a.b.c` → string). */
export type FlatMessages = Record<string, string>

/**
 * Flatten a nested catalog into dotted-path keys.
 * `{ a: { b: 'x' } }` → `{ 'a.b': 'x' }`.
 */
export function flattenMessages(messages: Messages, prefix = ''): FlatMessages {
  const out: FlatMessages = {}
  for (const key of Object.keys(messages)) {
    const value = messages[key]
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      out[path] = value
    } else if (value !== undefined) {
      Object.assign(out, flattenMessages(value, path))
    }
  }
  return out
}

const PARAM_PATTERN = /\{\{\s*([\w.]+)\s*\}\}/g

/**
 * Replace `{{param}}` placeholders with values. An unmatched placeholder is
 * left verbatim (a missing param is a content bug worth seeing, not hiding).
 */
export function interpolate(template: string, params?: TranslateParams): string {
  if (params === undefined) return template
  return template.replace(PARAM_PATTERN, (match, name: string) => {
    const value = params[name]
    return value === undefined ? match : String(value)
  })
}

/**
 * Deep-merge two catalogs; `override` wins on conflict. Useful for layering a
 * consumer's strings over a module's base catalog, or for BYO composition.
 * Pure — neither input is mutated.
 */
export function mergeMessages(base: Messages, override: Messages): Messages {
  const result: Messages = { ...base }
  for (const key of Object.keys(override)) {
    const o = override[key]
    const b = result[key]
    if (
      o !== null &&
      typeof o === 'object' &&
      b !== null &&
      typeof b === 'object'
    ) {
      result[key] = mergeMessages(b, o)
    } else if (o !== undefined) {
      result[key] = o
    }
  }
  return result
}
