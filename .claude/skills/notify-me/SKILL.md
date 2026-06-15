---
name: notify-me
description: "Send a macOS notification and a Telegram push on every Claude Code Stop event (turn-end). Useful for long autonomous runs and anything the user is walking away from.\nTRIGGER when: user says 'notify me when done', 'ping me', 'send me a notification', or otherwise asks for end-of-session pings; also pair with `independent-work` when the away window is non-trivial.\nDO NOT TRIGGER when: user is actively interactive — every turn fires a notification, which becomes noise."
user-invocable: true
hooks:
  Stop:
    - hooks:
        - type: command
          command: "~/.claude/hooks/notify-independent-work.sh"
---

# notify-me

When this skill is active, Claude Code fires `~/.claude/hooks/notify-independent-work.sh` on every `Stop` event (turn end). The hook sends a macOS notification and a Telegram message. **The bare default message is just `Claude Code session finished in: <project>` — useless to the user. Your job every turn is to write a summary so the push actually says what happened.**

## Write the per-turn summary — required every turn

Near the end of every turn, **overwrite** `~/.claude/hooks/notify-me-summary-$CLAUDE_CODE_SESSION_ID.txt` with a short status — write it with a shell command so the variable expands. The file is per-session, so concurrent agents never clobber each other's summaries; the hook reads your session's file on Stop, then deletes it. Do this on every turn the skill is active, including turns where you're handing back to the user. No exceptions — "nothing meaningful happened" still warrants a line ("Read the auth module; awaiting next instruction").

**Content — a couple of sentences covering:**
1. What was done this turn (past tense, concrete).
2. What remains, if anything is still open.
3. Whether you need input from the user, and what kind.

**Format:**
- 2–4 sentences. Hard cap 500 chars; ~300 is the sweet spot.
- Plain text, no markdown, no emoji.
- Lead with the action, not preamble. Skip "I" / "the agent".

**Examples:**
- `Fixed the focus-loss bug in identities page and added a regression test. All green. No further action needed.`
- `Migrated three components to the new Modal API; two left (SettingsModal, ShareModal). Will continue next turn unless you redirect.`
- `Stuck on Convex schema validation — the new field rejects existing rows. Need your call: backfill default vs. make optional. Paused until you reply.`
- `Read the auth flow end-to-end, no edits. Ready for the actual task whenever you are.`

## Reply polling (away mode)

When you end an **away-mode** turn (`independent-work` active) that genuinely needs the user's input — your summary poses a question you can't answer yourself — don't just stop. Poll for a Telegram reply: every 10 minutes for up to 2 hours, then give up. Only enter this loop when both hold: (a) you're in away mode, and (b) this turn awaits a user decision. Never in interactive sessions; never when the work is done with nothing pending.

The reply reaches you because you check for it — nothing can wake an idle session from outside. So pace the loop yourself with `ScheduleWakeup` (delaySeconds 600), i.e. `/loop` dynamic mode.

**One bot may serve several agents at once, so every message is keyed by a keyword.** Pick a short, distinctive, **alphanumeric** `KEYWORD` for this question (e.g. a task tag like `MODAL` or `AUTH7`). You only ever read replies that start with *your* keyword; other agents' replies are invisible to you, and the shared inbox log is never wiped.

1. Send the Telegram summary with **the keyword and the actual question in it**, and tell the user to **prefix their reply with the keyword** — e.g. `MODAL: keep the legacy onClose prop, or drop it? Reply starting with "MODAL".`
The keyword identifies your *inbound replies*; the mute flag is keyed by `$CLAUDE_CODE_SESSION_ID` so it silences only *your* session's pings.

2. Set this keyword's baseline so only newer replies count: `~/.claude/hooks/telegram-poll.sh reset MODAL`.
3. Record the start and enter quiet mode: `date +%s > ~/.claude/hooks/notify-me-poll-$CLAUDE_CODE_SESSION_ID.flag`. While your session's flag exists the Stop hook stays silent **for your session only** — that's what keeps the 10-min checks from pinging the user, without muting a sibling agent that finishes meanwhile.
4. Schedule the first check 10 minutes out (`ScheduleWakeup`, 600s).

On each wake, run `~/.claude/hooks/telegram-poll.sh MODAL` and branch on its output (the keyword is already stripped, so you get just the answer):
- **Reply printed** → `rm ~/.claude/hooks/notify-me-poll-$CLAUDE_CODE_SESSION_ID.flag`, end the loop, treat the reply as the user's new instruction, and resume work. (The next real Stop notifies normally.)
- **Empty, and `now - start ≥ 7200`** → `rm ~/.claude/hooks/notify-me-poll-$CLAUDE_CODE_SESSION_ID.flag`, write a summary like `No reply in 2h; stopped polling.`, and stop. With the flag gone, that final Stop delivers the message.
- **Empty, and under 2h** → schedule the next check (`ScheduleWakeup`, 600s). Nothing else.

Requires the bot to use polling, not a webhook — `getUpdates` returns 409 while a webhook is set (`deleteWebhook` to clear).

## Setup checklist

- `~/.claude/hooks/notify-independent-work.sh` and `~/.claude/hooks/telegram-poll.sh` exist and are executable (`chmod +x`).
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` exported in your shell (e.g. `~/.zshrc`) or in `~/.claude/hooks/notify-me.env`.
- This skill synced into the project's `.claude/skills/notify-me/` (managed by `dev sync skills`).

## Manual usage

```
/notify-me
```

Then run whatever you're walking away from. The hook fires on every Stop while this skill is active.

## Behavior notes

- Fires on every Stop, not just the final one. For a long unattended run, expect one notification at the end. For interactive sessions, expect one per turn — if that's noisy, ask Claude to add a duration gate (timestamp on `UserPromptSubmit`, compared on `Stop`).
- Hook is scoped to this skill's frontmatter — only fires while `notify-me` is active. No global Stop hook.
- Pairs naturally with `independent-work`: activate both at the start of an away run so the agent knows it's autonomous AND you get pinged on completion.
