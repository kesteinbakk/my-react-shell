# Docs & workflow (zingularis conventions)

**Maintainer guide — not shipped to consumers.**

```
docs/
├── 1-proposals/      # goals-only proposals (_template.md)
├── 2-tasks/          # TXXX-slug/task.md   (index: _index/<YYYY-MM>.md)
├── 3-bugs/           # BXXX-slug/bug.md    (index: _index/<YYYY-MM>.md)
├── 4-reports/        # reviews/ research/ status/
├── specifications/   # present-tense specs of what EXISTS (+ README index); api-reference ships in the package
├── guides/           # one consumer guide per module (ships in the package)
├── maintainers/      # agent/contributor docs, NOT shipped: release-runbook, module-authoring, my-react-shell-master role guides
├── roles/            # role method bodies (my-react-shell-master)
└── concept.md        # what this is + Default role
```

- **In-repo task/bug index** under `docs/{2-tasks,3-bugs}/_index/` — new rows on top;
  `top + 1` = next ID; reserve atomically (see the universal work-contract → Task & Bug
  Index). Statuses: `planning → in-progress → finished → archived`.
- Bug closure to `resolved` requires explicit user confirmation in the bug doc.
- Specs are present-tense, no task refs / line numbers / inline dates; update them when
  implementations change.
