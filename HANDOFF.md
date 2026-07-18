# Session handoff — read this first in a new session

This file exists because Roadmap Studio's build history lives in a long chat
session that mixed this project with an unrelated `Budget-APP` codebase, and
the user is switching to a fresh, project-scoped session (ideally one with
Supabase MCP authenticated, for direct DB access instead of copy-paste SQL).
Read this in full before doing anything else — it's the condensed memory of
everything built, why, and what's still outstanding.

Also read `AGENTS.md` (repo conventions: verification pipeline, migration
discipline, RLS recursion gotcha, commit style) and `README.md` (current
feature list and setup/deploy instructions) — this file covers the
*narrative* and *current state*; those cover the *reference* material.

## What this project is

A spreadsheet-driven roadmap planning tool (`/projects`, `/views`) plus a
completely separate Eisenhower-matrix priority to-do list (`/todos`), both
multi-tenant via Supabase-backed **workspaces** with real auth. Lives at
`roadmap-studio/` inside the `Budget-APP` monorepo but shares no code with
it. Deployed on Vercel, backed by Supabase project `txprazhgiinrxtpgpmia`.
GitHub remote: `chuanhao2002-bot/RoadMap-builder-`, branch `main`.

## Chronological build history (condensed)

1. **Roadmap Studio scaffold**: spreadsheet + Timeline/Swimlane/Kanban views,
   auto-generated from the spreadsheet. Supabase backend wired with
   magic-link auth, per-user RLS.
2. **Auth removed**: user asked to make it a single open shared workspace
   (no login at all) — `AuthGate`/`useSupabaseUser` deleted, RLS opened to
   `anon` (`0002_remove_auth.sql`). This was the state for most of the
   project's life.
3. **Iterative feature work** while open/no-auth: renamed KPI→Target Goal,
   removed then re-added progress tracking, added mandays, dependencies,
   milestones, CSV import/export, PPTX export, a real analytics dashboard,
   shareable read-only snapshots (`/share/[id]`, still public by design
   today), and the Priority To-Do page (`/todos`, Eisenhower matrix + list,
   fully separate data from projects, with a "→ Roadmap" bridge to convert
   a to-do into a project).
4. **User wanted to share the app** with others *interactively* (their own
   data, not seeing the user's) — this required bringing real auth back,
   but this time with a **workspace/team model** (not just per-person
   isolation), since the user explicitly chose "shared team workspaces"
   over "private per person" when asked.
5. **Auth + workspaces rebuilt from scratch** (`0011`–`0013`): new
   `workspaces`/`workspace_members`/`workspace_invites` tables, `workspace_id`
   added to `projects`/`saved_views`/`todos`, all stores (`useProjectStore`,
   `useTodoStore`, `useFilterStore`) rewritten to scope every query/insert/
   realtime-channel by workspace, `AuthGate` recreated, `/join/[token]`
   invite-accept flow, workspace switcher in the sidebar.
6. **Hit real problems in production, fixed live, in order**:
   - Magic-link redirect used `window.location.href` → broke when clicked
     from a different/offline environment than it was requested from. Fixed
     by pinning redirects to `NEXT_PUBLIC_SITE_URL` (`src/lib/siteUrl.ts`).
   - Supabase's built-in email sender hit its rate limit ("email rate limit
     exceeded") — no code fix possible for that specific limit, so **added
     email+password auth as the primary method** (`AuthForm.tsx`), magic
     link demoted to a fallback toggle. This is why login is
     password-first today.
   - After running the manual "claim your existing data into a workspace"
     SQL, hit a **Postgres infinite-recursion RLS bug**:
     `workspace_members_select` queried `workspace_members` from inside its
     own policy. This cascaded to break *every* policy that checked
     membership (workspaces, projects, saved_views, todos, invites) — fixed
     via `security definer` helper functions `is_workspace_member()` /
     `is_workspace_owner()` (`0014_fix_workspace_rls_recursion.sql`). If you
     ever add a new RLS policy that checks workspace membership, **use
     these helper functions, never an inline self-referencing subquery.**
   - Workspaces had no rename capability at all (not even an UPDATE RLS
     policy existed) — added in `0015_workspace_rename.sql` + Settings UI.
7. **Docs refreshed** (`README.md`, `AGENTS.md`) to match all of the above,
   since they'd gone stale describing the pre-workspace, pre-todo,
   no-auth version of the app.

## Current live database state (as of this handoff)

**Migrations `0001` through `0015` have already been manually applied to
the live Supabase project** by the user, pasting SQL into the Supabase SQL
Editor at each step throughout the build (this session never had working
Supabase MCP access, so every schema change was a manual copy-paste
hand-off). Each step was confirmed working end-to-end by the user in the
browser before moving to the next ("its working now", "all is working
good").

**However**, the live DB's exact state was never verified by directly
querying it (only inferred from the app behaving correctly in the browser).
If you now have Supabase MCP access, your first useful action is to
**verify, not blindly re-apply**:

1. Check which of `supabase/migrations/0001` through `0015` are actually
   reflected in the live schema (table existence, columns, RLS policy
   names/definitions, the `is_workspace_member`/`is_workspace_owner`
   functions).
2. Confirm no rows have a null `workspace_id` in `projects`, `saved_views`,
   or `todos` (the claim step should have backfilled all of them).
3. Confirm RLS on `projects`/`saved_views`/`todos` is the **workspace**
   version (`*_ws_select` etc., or the post-`0014` versions using the
   helper functions) — **not** still the old open `anon` policies from
   `0002`/`0009`/`0010`.
4. Most migration files use `if exists`/`or replace` guards and are safe to
   re-run if something is missing or inconsistent — but confirm before
   re-running rather than assuming.

If everything checks out, there is **no pending migration work** — this was
just never independently verified against the live DB until now, since all
prior verification was "does the UI work," not "does the schema match."

## Known outstanding items / gaps (not urgent, just not done)

- No member-removal UI (Settings only supports invite + rename so far).
- No role management beyond owner/member.
- Timeline dependency links show an at-risk marker + popover text, not
  literal drawn connector lines between bars (explicitly descoped — the
  table's dynamic row-grouping makes accurate cross-row line drawing a
  much bigger, separate effort).
- No presenter notes/timer/laser pointer in Presentation mode.
- Magic link is a fallback only (rate-limited); would need custom SMTP
  configured in Supabase to be reliable as a primary method.

## Working conventions (see AGENTS.md for full detail)

- Always run `npm run lint && npx tsc --noEmit && npm run build` clean
  before committing.
- New schema changes are new numbered migration files, never edits to
  existing ones — fix bugs with a new migration (see how `0014` fixed
  `0011`/`0013`).
- If Supabase MCP is authenticated: apply migrations directly and verify
  against the live schema before reporting done. If not: hand the user
  exact SQL for the Supabase **SQL Editor** (never the Table Editor's
  row-insert UI).
