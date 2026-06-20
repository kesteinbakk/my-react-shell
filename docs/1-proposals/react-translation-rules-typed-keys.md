# Proposal: react-translation-rules — make typed i18n keys the documented standard

**Date**: 2026-06-20 | **Status**: draft

## What

Update the `react-translation-rules` skill so that **typed i18n keys**
(`createTypedI18n` + `DotPaths`, shipped in T007 / strategy D14) are the documented
standard for wiring i18n in a my-react-shell consumer — not the stringly-typed
`useTranslation` the skill teaches today.

## Why

T007 lifted compile-time key safety into the shell's i18n seam (D14). This skill is
the guidance React agents follow when adding or auditing user-facing text, and it
currently shows only the untyped `useTranslation` from `my-react-shell/i18n`. As
written, an agent following it keeps wiring the stringly seam and never reaches for
the safety that now ships — so the ecosystem's strongest i18n property stays
invisible to the agents meant to apply it. The skill should steer consumers to the
typed seam by default, while keeping the rules it already gets right (both-language
parity, Norwegian characters, central-catalog policy, "verify a key resolves").

## User Goals

The skill should guide an agent to:

- **Wire the seam typed.** Bind a key union once with `createTypedI18n` (a
  hand-written union, or one derived from the catalog with `DotPaths<typeof catalog>`)
  and import the returned typed hooks (`useTranslation`, `useT`, `translateNow`) from
  the consumer's local seam, rather than the bare module — so a typo or an unknown key
  is a compile error, not just a runtime miss.
- **Know it is non-breaking.** Generics default to `string`; a file importing the bare
  hooks keeps working untyped, and typed keys can be adopted incrementally.
- **Not mistake types for parity.** Typed keys catch typos and unknown keys; they do
  **not** replace locale parity — the union derives from one catalog, so a key present
  in one locale but missing in another still surfaces only in the missing-key overlay.
  The both-languages-at-parity rule stands unchanged.
- **Find the authority.** Point at the i18n guide's new "Typed keys" section for the
  full API and wiring.

## Open Questions

- Should the typed seam become the **default** the skill teaches (rewrite the Core
  Rule example to import the consumer's typed seam), or a **recommended layer** shown
  above the existing stringly examples? (Leaning: make it the default, since T007 makes
  it the seam standard.)
- This skill is **sync-managed** — its source is
  `~/Developer/dev-docs/skill-source/development/react-translation-rules/`, and the
  copy under this repo's `.claude/skills/` is a synced artifact that a Skill-Sync run
  overwrites. On approval the edit is made at that source and re-synced, **outside this
  repo**. Confirm that flow (this is why the change is proposed here rather than applied
  to the local copy).

## References

- T007 (`docs/2-tasks/T007-typed-i18n-keys/task.md`) and strategy **D14** — the typed
  keys this proposal documents.
- The "Typed keys" section in `docs/guides/i18n.md` — the API + wiring the skill would
  point to.
- Skill source: `~/Developer/dev-docs/skill-source/development/react-translation-rules/SKILL.md`
  (the local `.claude/skills/react-translation-rules/SKILL.md` is a synced copy).
