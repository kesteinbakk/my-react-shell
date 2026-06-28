# src/themes — VENDORED, do not edit by hand

These files are **copies** of the shared `themes` package, vendored into the
shell so consumers depend on only `my-react-shell` (never the transitive
`themes` git-dep). Edit colours in `~/Developer/themes`; they flow here via
`pnpm sync:themes` (the dev watcher does it automatically — see
docs/maintainers/release-runbook.md). A pre-commit guard keeps these in lockstep with
the resolved `themes`.
