# Proposal: De-risk the `link:` dev-loop against duplicate-React crashes

**Date**: 2026-06-16 | **Status**: draft

## What

A consumer that follows the documented local `link:` dev-loop faithfully still
hits a hard, app-wide runtime crash the first time it renders a my-react-shell
component that calls hooks. The consumption docs, the README adoption checklist,
and the reference consumer config (`my-react-shell-demo`) should be enough to
stand up a working consumer — today they are not. Close that gap.

## Why

The `link:` loop symlinks the sibling checkout into the consumer's
`node_modules`. Because my-react-shell carries its **own** `node_modules/react`
(it must — React is a devDependency for its dev-harness, build, and tests), the
consumer's bundler resolves **two physically distinct React copies** at once: the
app's own copy, and the linked package's copy reached through the symlink. Two
Reacts share no hook dispatcher, so the first my-react-shell component to run a
hook under the app's renderer throws `Invalid hook call` /
`Cannot read properties of null (reading 'useContext')`, and the whole tree falls
to the error boundary.

This is a well-known React + bundler footgun, but **nothing in my-react-shell
flags it.** The distribution guide, README, and consumer-adoption checklist
document the loop in detail (keep `dist/` fresh, strip the link before commit,
satisfy peers, wire Tailwind) and never mention it. The shell's own demo and
dev-harness Vite configs don't guard against it either. So the requirement is
invisible: a consumer does everything the docs say and the app still won't boot.

It surfaced in evaluering (the first real consumer, posture C), where the entire
app crashes at first paint. It was missed because the consumer's green checks —
`vite build` and the vitest suite — resolve React differently than Vite's dev
pre-bundler, so none of them exercise the failing path; and the consumer's
browser preview was blocked during the build-out, so it was never run live.

Note the scope: this bites the **`link:` dev-loop specifically** (a symlinked
sibling dragging in its own React). The tag-pinned git-dependency path is
expected to dedupe React through the peer-dependency mechanism and not hit this —
but the `link:` loop is the *prescribed and primary* path for local
co-development (and the only viable one for a local-only consumer), so the gap is
squarely on the happy path, not a corner case.

## User Goals

- A developer can stand up a my-react-shell consumer using only the documented
  `link:` dev-loop and have it boot and render — no undocumented step required.
- The reference consumer (`my-react-shell-demo`) demonstrates the working
  configuration, so a consumer can copy it with confidence rather than rediscover
  the requirement by crashing.
- Whatever the consumer must do (or must not have to do) is stated once, in the
  consumer-adoption section, next to the peers / Tailwind / strip-the-link steps.
- The failure mode is named in the docs, so the next consumer who sees
  `Invalid hook call` recognizes it instead of debugging it cold.

## Open Questions

- **Document vs. eliminate.** Should the fix be a documented consumer step
  (collapse the duplicate React in the consumer's bundler config), encoded into
  the reference consumer config and a consumer template, designed away at the
  package/loop level (e.g. a symlink-preserving resolution posture), or some
  combination? This is the shell owner's call — hence a proposal, not a task.
- **Which packages must collapse to one copy?** Observed crash originated in the
  Convex React layer beneath the auth seam, not only React itself — so the answer
  may extend past `react` / `react-dom` to the Convex packages a consumer shares
  with the seam. Needs confirming against a consumer that uses
  `my-react-shell/auth/convex`.
- **Does the demo actually escape this, or is it latently broken?**
  `my-react-shell-demo` uses the same loop with two React copies and no guard, yet
  is theme-only (no Convex, no auth, no router) and may simply not trip the
  pre-bundle boundary — or may never have been run live. Confirm before treating
  it as a "known-good" reference.
- **Does the git-dependency path truly avoid it?** Confirm a tag-pinned git-dep
  consumer dedupes React via peers and needs none of this, so the guidance can be
  scoped to the `link:` loop and not over-applied.

## References

- Surfaced by evaluering's T015 frontend-rebuild (first real consumer); see that
  repo's `docs/2-tasks/T015-frontend-rebuild/` and the 2026-06-16 away-report.
- Touch points here: `docs/guides/distribution-model.md` (Local dev-loop / Consumer
  adoption), `README.md` (Local dev-loop), `my-react-shell-demo/vite.config.ts`
  (reference consumer config), `package.json` (`react` as peer + devDependency).
