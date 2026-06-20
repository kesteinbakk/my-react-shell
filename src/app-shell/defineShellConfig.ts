/**
 * defineShellConfig — builder + validator for the shell config.
 *
 * Validates the author-facing input synchronously (throwing `ShellConfigError`
 * at module-load time, when the consumer imports its shell config) and returns a
 * frozen, branded `ShellConfig`. The brand is defense in depth: a re-import or
 * dynamic factory can forge a raw object that satisfies the structural type, so
 * `<AppShell>` re-checks the symbol at runtime.
 */

import { SHELL_CONFIG_BRAND } from './shellContract'
import type {
  PageContainerMaxWidth,
  PageEntry,
  ShellConfig,
  ShellConfigInput,
  ShellTabsVariant,
} from './shellContract'

const MAX_WIDTHS: readonly PageContainerMaxWidth[] = ['sm', 'md', 'lg', 'xl', '2xl', 'full']
const TABS_VARIANTS: readonly ShellTabsVariant[] = ['underline', 'pill']

export class ShellConfigError extends Error {
  constructor(message: string) {
    super(`[AppShell config] ${message}`)
    this.name = 'ShellConfigError'
  }
}

function validatePageEntry(
  entry: PageEntry,
  parentRoute: string | null,
  seenIds: Map<string, string>,
  seenRoutes: Map<string, string>,
): void {
  if (typeof entry.id !== 'string' || entry.id === '') {
    throw new ShellConfigError('every page needs a non-empty string `id`.')
  }
  const idOwner = seenIds.get(entry.id)
  if (idOwner !== undefined) {
    throw new ShellConfigError(`duplicate page id "${entry.id}" (already declared by route "${idOwner}").`)
  }
  if (typeof entry.route !== 'string' || !entry.route.startsWith('/')) {
    throw new ShellConfigError(`page "${entry.id}" needs a \`route\` starting with "/".`)
  }
  const routeOwner = seenRoutes.get(entry.route)
  if (routeOwner !== undefined) {
    throw new ShellConfigError(`duplicate route "${entry.route}" (already declared by page "${routeOwner}").`)
  }
  if (typeof entry.label !== 'function') {
    throw new ShellConfigError(`page "${entry.id}" needs a \`label\` thunk (() => string).`)
  }
  if (typeof entry.icon !== 'string' || entry.icon === '') {
    throw new ShellConfigError(`page "${entry.id}" needs a non-empty string \`icon\`.`)
  }
  if (parentRoute !== null) {
    if (entry.route === parentRoute || !entry.route.startsWith(`${parentRoute}/`)) {
      throw new ShellConfigError(
        `sub-page "${entry.id}" route "${entry.route}" must be nested under its parent "${parentRoute}/".`,
      )
    }
  }
  seenIds.set(entry.id, entry.route)
  seenRoutes.set(entry.route, entry.id)
  if (entry.subPages !== undefined) {
    if (!Array.isArray(entry.subPages)) {
      throw new ShellConfigError(`page "${entry.id}" \`subPages\` must be an array.`)
    }
    for (const sub of entry.subPages) {
      validatePageEntry(sub, entry.route, seenIds, seenRoutes)
    }
  }
}

export function defineShellConfig(input: ShellConfigInput): ShellConfig {
  if (input === null || typeof input !== 'object') {
    throw new ShellConfigError('config must be an object.')
  }
  if (typeof input.appName !== 'string' || input.appName === '') {
    throw new ShellConfigError('`appName` must be a non-empty string.')
  }
  if (input.appNameRender !== undefined && typeof input.appNameRender !== 'function') {
    throw new ShellConfigError('`appNameRender` must be a function when present.')
  }
  if (typeof input.renderIcon !== 'function') {
    throw new ShellConfigError('`renderIcon` is required and must be a function (the module ships no icon kit).')
  }
  // `pages` may be empty: a card-dashboard app has no fixed top-level nav for
  // non-admin roles (it navigates via the home cards + breadcrumbs). Still must
  // be an array — a missing/non-array `pages` is an authoring error.
  if (!Array.isArray(input.pages)) {
    throw new ShellConfigError('`pages` must be an array.')
  }
  const seenIds = new Map<string, string>()
  const seenRoutes = new Map<string, string>()
  for (const page of input.pages) {
    validatePageEntry(page, null, seenIds, seenRoutes)
  }
  if (input.pageContainer !== undefined && !MAX_WIDTHS.includes(input.pageContainer.defaultMaxWidth)) {
    throw new ShellConfigError(
      `\`pageContainer.defaultMaxWidth\` must be one of ${MAX_WIDTHS.join(', ')}.`,
    )
  }
  if (input.tabs !== undefined && !TABS_VARIANTS.includes(input.tabs.variant)) {
    throw new ShellConfigError(`\`tabs.variant\` must be one of ${TABS_VARIANTS.join(', ')}.`)
  }
  if (input.shellPageHeader !== undefined && typeof input.shellPageHeader.border !== 'boolean') {
    throw new ShellConfigError('`shellPageHeader.border` must be a boolean.')
  }
  return Object.freeze({ ...input, [SHELL_CONFIG_BRAND]: true as const })
}
