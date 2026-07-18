<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Working notes for this repo (Roadmap Studio)

These capture conventions established while building this project, so any
session follows the same discipline without re-deriving it from scratch.

## Verify before every commit

Always run, in this order, from `roadmap-studio/` (or wherever this repo is
checked out):

```bash
npm run lint
npx tsc --noEmit
npm run build
```

All three must be clean before committing. Don't skip `tsc` even if `build`
would catch most of the same errors — it's faster feedback and catches a few
things `next build` doesn't surface as clearly.

## Database changes: Supabase migrations

- Every schema change is a new numbered file in `supabase/migrations/`
  (`0016_...sql`, incrementing — never edit or renumber an existing
  migration file, even if it turns out to have a bug; fix bugs with a new
  migration, the way `0014_fix_workspace_rls_recursion.sql` corrected
  `0011`/`0013`).
- If the Supabase MCP server is connected and authenticated, apply the
  migration directly via `mcp__Supabase__apply_migration` and verify with
  `mcp__Supabase__list_tables` / a `select` before telling the user it's
  done.
- If Supabase MCP is unavailable or unauthenticated (this has been the
  common case so far), hand the user the **exact SQL** to paste into the
  Supabase **SQL Editor** (never the Table Editor's row-insert UI — that's
  a real trap a user hit early in this project's history). Tell them
  explicitly which tab/page to use.
- Prefer staged rollouts for anything that touches RLS or adds a `not null`
  column to a live table: add the column nullable first, backfill, *then*
  tighten constraints and swap policies in a later migration — see how
  `0012` → manual claim step → `0013` was sequenced. This avoids locking
  users out mid-migration.
- Watch for **RLS self-reference recursion**: a policy on table X that
  subqueries table X itself (even indirectly) will make Postgres reject it
  with infinite-recursion errors, and — worse — silently break every other
  policy that transitively depends on table X. Use a `security definer`
  helper function instead (see `is_workspace_member` / `is_workspace_owner`
  in `0014_fix_workspace_rls_recursion.sql`) whenever a policy needs to
  check membership/ownership by querying the same table's rows.

## Testing changes without live Supabase access

This sandbox typically cannot reach the live Supabase project directly
(network policy blocks it, and the Supabase MCP connector requires an
OAuth login that can't be completed non-interactively). Practical
consequence: **`npm run build` passing does not mean a Supabase-dependent
feature actually works** — it only proves the code compiles.

- For UI-only verification (does a component render, does an error surface
  instead of crashing, are public routes actually ungated), run the dev
  server and drive it with a headless browser
  (`playwright-core`, pointed at `/opt/pw-browsers/chromium-*/chrome-linux/chrome`
  — see git history around the auth-form rewrite for a working example).
  This catches real bugs (e.g. a lint error in an effect, a route
  incorrectly gated) before the user has to.
- For anything that actually touches the database (RLS policy correctness,
  whether a migration applied cleanly, whether data persists), the user has
  to test it live and report back — usually with a screenshot. Screenshots
  with the exact on-screen error text are what actually gets bugs fixed in
  one round-trip (see: rate-limit error, RLS recursion, redirect
  ERR_CONNECTION_REFUSED) — don't guess at causes when the user can just
  paste the error.

## Commit style

- One logical change per commit; for multi-part feature batches, commit
  each phase separately as it's verified (see the PM-feature-batch and
  multi-user-auth work for the pattern: schema → scaffolding → UI →
  cutover, each its own commit).
- Message format: short imperative summary line, blank line, then a body
  explaining *why*, not a restatement of the diff. Call out any manual
  follow-up the user still owes (a migration to run, an env var to set) in
  the commit body when relevant — it doubles as a record of what shipped
  vs. what's still pending.
- Never commit `.env.local` or any file containing the Supabase URL/key
  outside of documented placeholders.

## Environment / redirect URLs

`NEXT_PUBLIC_SITE_URL` must be set per-environment (local `.env.local`,
Vercel project env vars) and kept in sync with Supabase's Authentication →
URL Configuration → Redirect URLs allow-list. Auth email links
(`emailRedirectTo`) are built from this value, not `window.location.href` —
don't reintroduce a `window.location.href`-based redirect; it's fragile
across environments (see `src/lib/siteUrl.ts`).

## Feature-specific gotchas

- `PROJECT_COLUMNS` (`src/types/project.ts`) drives both the spreadsheet's
  column order/labels **and** CSV export/import — adding a `Project` field
  usually means updating this array, `projectMapper.ts` (camelCase ⇄
  snake_case row mapping), the seed data in `useProjectStore.ts`, and the
  corresponding migration, all together.
- Status/priority option lists are centralized in `src/lib/projectOptions.ts`
  — don't reintroduce duplicate `STATUSES`/`PRIORITIES` arrays in
  individual components.
- Every workspace-scoped store (`useProjectStore`, `useTodoStore`,
  `useFilterStore`) follows the same shape: `init(workspaceId)` guards on
  `loaded && workspaceId` match, opens a realtime channel filtered to that
  workspace, and `reset()` tears it down on sign-out. Follow this pattern
  for any new workspace-scoped data type rather than inventing a new one.
