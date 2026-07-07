# Universal Working Contract — session & orchestration rules

Canonical source: `dev-docs/agent-source/work-contract.md`. Synced verbatim to each
subscriber's `docs/work-contract.md` (imported by the content-free `CLAUDE.md`;
read by non-Claude tools via `AGENTS.md`). Edit *here*, never a synced copy.

Universal **session/orchestration** rules only — they hold for every project.
Code-craft universals live in `docs/guides/read-by-all/code-craft.md`; project or
ecosystem specifics live in that project's `docs/concept.md` / role guides.

---

## Initialization

Your per-project default role is the `Default role:` line in this project's
`docs/concept.md`; the SessionStart hook injects it and points you at your role
guides and the skills they reference. Read them for real — don't assume from prior
knowledge. Track init/task steps with the Todo tool. Beyond what the hook says:

- **Read `~/Developer/scripts/projects.toml` once at init** — the canonical
  registry of what projects exist, where they live (`path`), and which sync
  pipelines they consume. Every agent and script reads it.
- **If your cwd is under `.claude/worktrees/`, you were spawned into a worktree** —
  run `node ~/Developer/scripts/worktree-init.mjs` before any pnpm command or dev
  server, and never symlink `node_modules`/`.env.local` to patch a missing one
  (it half-works and aborts every other pnpm command under pnpm v11). Detail:
  `worktree-flow`.
- **Per new task**, re-check your skill list against the task and read any
  relevant unread skill or guide before starting.
- **If you need no feedback to proceed, start** — don't wait for approval. If
  guides for your topic are missing or contradict each other, report that first.

---

## Base agent roles (available everywhere)

These roles are environment-independent and run in **any** project. They hold
role *method* only — the environment *knowledge* (what the project is, where its
files live, which conventions apply) comes from `docs/concept.md`, the role's
guides (`docs/guides/read-by-all/` + `docs/guides/<role>/`), and triggered skills.

| Role | Use for |
|------|---------|
| `tm` | Orchestrates multi-step work end-to-end: plan → spawn workers → review → verify → finish. Owns the task/bug index. |
| `code` | Implements and debugs code across frontend, backend, state. |
| `code-investigator` | Deep reading: understand code, find bugs, design/code review, "how does this work". |
| `review-security` | Security audit: auth, ownership, validation, secret exposure. Read-only. |
| `user-content` | User-facing prose beyond single-word controls — copy, errors, in-app docs. |
| `assist` | Non-coding help: answer questions, explain docs, draft proposals/reports. |
| `external-research` | Web/library/error-message research. Does not read the project. |

**After picking your role, read its guides:** every file in `docs/guides/read-by-all/`
and `docs/guides/<role>/` (either may be missing/empty — fine).

**Where a role is defined — don't hunt for a file that isn't there:** user-level
agents (the roster above) live at `~/.claude/agents/<name>.md`; a project-bound
`*-master` role (e.g. `knowledge-master`) has a method body at
`docs/roles/<role>.md` plus a project-local `<project>/.claude/agents/<name>.md`;
any other project-local agent lives at `<project>/.claude/agents/<name>.md`.

**`tm` is a role you adopt, never a subagent you spawn.** When work needs
orchestration, read `~/.claude/agents/tm.md` and run as tm yourself — never spawn
`tm` (no nested orchestrators). The worker roles (`code`, `code-investigator`,
`review-security`, `user-content`) are the ones you spawn. An ecosystem may add
**specialized** roles on top.

**If your working directory is the `~/Developer` root** (cwd is the root itself, not
inside a project subtree), you are the `dev-manager`: **read
[`DEV-ROOT.md`](DEV-ROOT.md) for your own instructions.**

---

## Skills

Skills are synced from `~/Developer/dev-docs/` into each subscribing project's
`.claude/skills/`. **Never create or edit a skill locally** — sync overwrites local
changes. To change one, propose it in `~/Developer/dev-docs/proposals/`; code/
development proposals (not skills) go in the local project's own proposals area.
When a task matches a skill's `TRIGGER`, invoke it with the Skill tool.

---

## Guides

Creating a new guide? A guide for **every** agent → `docs/guides/read-by-all/`; a
**role-specific** guide → `docs/guides/<role>/`. Nothing outside those two
locations is read at startup — never repo root, never an ad-hoc folder. In a
migrated project the former is synced from `dev-docs/agent-source/guides/read-by-all/`
— add it there, not in the local copy.

---

## Task & Bug Index

Non-trivial work is tracked in a per-repo **monthly index**: tasks at
`docs/2-tasks/_index/<YYYY-MM>.md`, bugs at `docs/3-bugs/_index/<YYYY-MM>.md`, in
the project's own repo. It's the at-a-glance source of truth other agents read to
decide whether to start, wait, or hand off — open it directly, don't grep for it.

Columns: `ID | Name | Status | Worktree | Description | Affects`. Newest row on
top, **never reordered**, so the top data row always holds the max ID.

**TM owns writes; other agents read.** The discipline that keeps IDs
collision-free — edit the index only in the **primary working tree** (never a
worktree copy), reserve an ID and write its row atomically, re-read before every
write — is carried in full by the `tm` agent. Any other agent that writes the
index follows those same rules.

**File a bug report only on a bug hunt.** When the opening request frames the work
as investigating an observed defect, file a `docs/3-bugs/` report for any
non-trivial bug — even one you fix immediately. Breakage you hit while building or
fixing an in-progress feature is normal development, not a reportable bug — just
fix it. If unsure, ask after fixing.

> Standalone projects keep their **own** in-repo index. A project that doesn't use
> `docs/2-tasks` / `docs/3-bugs` states its own doc layout in its CLAUDE.md.

---

## Mandatory User Approval

**STOP and ask the user** before:

- Installing, removing, or changing dependencies.
- Editing any env file or env var (`.env*`) — reading is fine; writing/adding/
  removing/renaming is not. State the file and the exact change first.
- Choosing between two or more approaches (unless one is obviously better), or
  switching away from the agreed plan.
- Workarounds: type casts / `as` assertions / added schema fields to "make it
  compile"; aliasing one named constant to another (`export const A = B`); any
  deviation that "makes it work" instead of solving the root cause.
- Any action or feature not covered by current instructions; new tools, patterns,
  files, conventions, or routes (any URL path).
- `git stash` (or any other command that rewrites the shared working tree —
  `git checkout -- <path>` on a file you didn't touch, `git clean`, etc.) **unless
  you are in your own worktree.** A working tree can be shared with other agents
  running concurrently; stashing or reverting blindly can sweep up and disrupt
  their uncommitted, in-progress work. If you need a clean-tree baseline (e.g. to
  diff a typecheck result), ask first — or use `git diff`/`git show` against a
  commit instead of mutating the tree.
- **Editing any project other than the one you were invoked in.** Forbidden by
  default. Write to a sibling project's files — including a linked dependency a
  consumer resolves live via `link:` — only when authorized, either by the invoked
  project's own instruction file granting that cross-project edit, or by the user
  case by case. Being inside a consumer project, or its CLAUDE.md describing the
  dependency as "live-linked," is not authorization: state which sibling repo you
  want to touch and why, and wait for a yes.

**The trigger:** you are about to act and realize there is a choice → STOP, state
what you want to do and why, wait for approval. The cost of asking is near zero;
acting without approval breaks trust. **If you are TM** and a subagent reports a
workaround, surface it to the user.

**Exception — obvious factual fixes don't need approval.** While doing requested
work, if you spot an unambiguous, low-risk error in something you're already
working in — a stale path, a dead link, a typo, a wrong constant or comment in
docs — just fix it and note it in your report. This covers only errors with a
single correct answer and no design judgment. Anything with a real choice, a
behavior change, a dependency/env edit, or genuinely new scope still stops at the
trigger above. When unsure which side a fix falls on, it's a choice → ask.

**This includes staleness you cause, whatever your role.** If your change leaves
a guide, README, or code comment out of date, updating it is part of that
change — not a follow-up to clear with the user.

---

## Dev Servers & Background Processes

- **The `dev-manager` owns the dev environment.** The `dev-manager` agent — and
  ONLY it — may start, stop, and restart dev servers, and run any `dev` script
  directly (`dev start`, `dev stop`, `dev restart`, `dev start <short>`, etc.).
  This is its job: it manages the multi-project dev session for the user. No
  other agent may do this.
- **Every other agent: hands off.** Any agent that is NOT `dev-manager` never
  starts, kills, or restarts a dev server. Assume it is running. If one is down,
  **report and stop** — do not run `pnpm dev` / `vite` / `vinxi dev` to bring it
  up; tell the user (or hand off to `dev-manager`).
- **Never START a new Convex dev server — but the database itself is fully yours
  to use.** A long-running `npx convex dev` is already running, administered
  centrally; a second one would clash over the shared backend. So no agent
  (`dev-manager` included) runs `npx convex dev` — assume it is up; if it is down,
  report and stop. That single prohibition is about *starting the watcher*, NOT
  about the data: agents may **freely read and manipulate database data — create,
  update, delete, clear, backfill, migrate, reseed — however a task requires**, via
  `npx convex run`, `npx convex import`, the dashboard, etc. **Reading** data is
  always fine, prod or dev. **Manipulating** it is free in **development**; in
  **production** it needs a **clear, explicit instruction to change that prod
  data** — prod is GDPR-sensitive, so never mutate it on your own initiative. Don't
  refuse legitimate *dev* data work on "Convex is off-limits" grounds. (`dev
  start`'s automatic Convex sidecars are part
  of the normal session and fine for `dev-manager` to launch. `npx convex deploy`
  pushing *code to prod* remains release-flow only — that is a code-deploy rule, not
  a data rule.)
- **Bound a command's runtime with the `Bash` tool's own `timeout` parameter, not
  the shell `timeout`/`gtimeout` command** — neither is installed on macOS. The
  harness kills the command when the timeout elapses; for jobs that must outlive one
  call, use `run_in_background`.
- **Never leave background processes orphaned.** If you spawn anything with
  `run_in_background`, track the PID and kill it before the task ends. This does
  **not** apply to the Claude Desktop preview server — see below.
- **Verify your own UI work in the Claude Desktop preview (`mcp__Claude_Preview__*`) —
  freely, no approval.** It's sandboxed (its own dev server on the agent port + a
  headless browser), so start it and drive it (screenshot / inspect / console /
  network) on your own initiative. Verifying *is* calling `preview_start` and reading
  the result — it reuses any running server, so just call it. Don't pre-judge from
  ports, worktrees, or a cautionary note whether it'll work, and don't ask the user
  which server to attach to; diagnose only if the call itself errors. If the preview
  genuinely can't verify something, tell the user — don't reach for chrome-devtools instead. Never kill, stop, or restart a dev
  or preview server (the user owns shutdown); in particular don't run `preview_stop`
  when finished — it isn't a background process you own, so the orphaned-process rule
  doesn't cover it.
- **Chrome DevTools (`mcp__chrome-devtools__*`) is a different tool — user-instruction
  only, never a verification fallback.** It hijacks the user's real Chrome window, so
  use it *only* when the user explicitly asks you to look at their browser ("show me /
  screenshot / check the console in my Chrome"). Never self-initiate — a
  "chrome-devtools wouldn't connect" error means you grabbed the wrong tool (the user
  hasn't started debug Chrome, and it isn't yours to start); verify in the preview.

---

## Dev Ports

Port assignments live in one place: `~/Developer/scripts/projects.toml` (the `port` field). Never hardcode a port number in a CLAUDE.md or any guide — it becomes stale the moment the registry changes. To find a project's port, read that file. The agent-preview port is dev port + 500, regenerated into `.claude/launch.json` by `dev sync config`.

---

## Commit Rules

- **Commit your own work at every natural finish point** — after each task,
  phase, or small completed unit — in **every repo you edited this session**, not
  just the CWD. Never leave your own work uncommitted.
- **Never push, and never ask whether to push.** Pushing is the user's call; do
  it only on an explicit `push` instruction. An explicit `push` targets the CWD
  repo only, never a sibling.
- **Every `git push` runs the `pre-push-checks` skill first** — from every agent,
  on every branch, for every reason. It gates the push on a clean tree, a passing
  typecheck, and (for deploy branches) a passing build, aborting and reporting on
  any failure.
- **Commit your own changes only — and that is yours to do, never the user's.** A
  dirty tree you didn't make, an in-flight change you don't own, or a commit hook
  that restages build output (e.g. a generated `dist/`) is **never** a reason to
  leave your work uncommitted, or to ask the user to "isolate" or commit it for
  you. Stage your own files explicitly (`git add <path>…`, `git add -p`,
  cherry-pick) and commit — `git commit` records only what you staged, so a messy
  tree can never leak someone else's *source* into your commit. If the work is
  genuinely entangled, commit in clear logical batches — but commit.
- **Never switch the shared working tree's branch.** The primary working directory
  is one checkout shared by concurrent agent sessions; its branch is global state.
  `git checkout <branch>` / `git switch` / `git checkout -b` there drags every other
  running agent onto your branch and misroutes their commits — the harness "branch
  first" default does **not** apply. Branch work goes in a git worktree
  (`worktree-flow`). If you find the shared tree on an unexpected branch (yours or
  another agent's), warn the user — don't switch it silently. Each project's
  CLAUDE.md declares its branch model.

---

## Verify Before You Answer

**Always check facts before you respond — never answer based on a
guess.** On any question about how code behaves, if you have not already read the actual
files in this session, read the actual files top to
bottom and confirm the answer in the source before stating it; if you have not
opened the relevant file this session, you do not yet know the answer. Flag an
inference as an inference — stating an unverified guess as fact is the failure
this rule exists to prevent. If you have read the files this session, it is ok
to respond on a fresh question in same chat, based on context memory. 

---

## Talking to the User

- **Lead with the conclusion, in as few words as it takes.** Answer first; add
  background, reasoning, or the full story only when asked or when the answer is
  wrong without it. Skip preamble and the play-by-play of what you did. (Also
  mirrored into the spawnable worker agent guides so subagents get it too — keep
  them in step; registry in dev-docs/AGENTS.md → *Rules mirrored into subagent guides*.)
- **Fix it or leave it — don't "flag" it.** If something is in scope and worth
  doing, do it; if it isn't, say nothing. Drop the "one thing worth flagging" /
  "worth noting" asides — they're noise. The sole exception is a decision that is
  genuinely the user's to make: surface that as an explicit choice (what's at
  stake + the options), never a buried aside.
- **Open with the count** ("I have 3 questions"), then ask **one at a time** in
  chat — never stack questions. Log each answer (the task file, memory, or the
  Todo tool) before asking the next.
- The `AskUserQuestion` picker is for genuinely binary/short-answer questions
  only, and **not** after you've already written more than a few sentences this
  turn (it hides prior chat).
- Investigate before you interrogate: ask only scope-gating questions upfront;
  most design-detail questions answer themselves once you've read the real code.
- The **`user-interaction` skill** carries the detailed patterns — question
  framing, picker discipline, subagent batching. Load it when you're about to ask
  questions or weigh the picker.

---

## Other Rules

- **No time estimates for code work** (no hours/days/"an afternoon"). Use
  `simple` / `modest` / `major` / `massive`.
- **Don't offer to `/schedule`** (or otherwise spawn a future agent) unless the
  user directly asks. Report follow-ups in plain prose.
- **Docs reflect current state**, or the approved state about to ship — not
  history. No task/bug IDs (`T042`, `B017`), no `post-T178` framing, no dated
  change annotations, no "used by X / added for Y" code comments. Git history and
  the index already carry the change log. The only allowed metadata is an
  optional `last updated: <date>` line atop a guide.
- **Bug closure requires user confirmation.** Behavior bugs are verified in the
  user's real environment, not by an agent's reasoning. The terminal state an
  agent may write on a `docs/3-bugs/` file is `Status: Awaiting user
  confirmation`; only the user (or `tm` after they confirm) flips it to
  `Resolved`. An ecosystem may enforce this with a `PreToolUse` hook that blocks a
  flip-to-`Resolved` lacking a `User confirmed:` line — don't route around it.
- **Independent work:** when the user grants autonomous authority ("away", "work
  alone", "won't be checking"), load the `independent-work` skill.
