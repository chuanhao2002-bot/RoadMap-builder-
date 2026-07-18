# Roadmap Studio

A spreadsheet-driven roadmap planning tool with a separate priority to-do
list. The Projects spreadsheet is the single source of truth for the
roadmap — every roadmap visualization is generated from it automatically.

This is a separate Next.js project living in `roadmap-studio/` inside the
Budget-APP repo. It does not share code with the budget app.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase Postgres for persistence, with Zustand stores as a local cache
  layer and Realtime subscriptions keeping tabs/sessions in sync
- Supabase Auth (email + password, with magic link as a fallback) —
  `src/components/auth/AuthForm.tsx`, `AuthGate.tsx`
- Multi-tenant **workspaces**: every project/to-do/saved view belongs to a
  workspace; access is controlled by workspace membership (RLS), not a
  single shared pool
- `html-to-image` + `jsPDF` + `pptxgenjs` for PNG/SVG/PDF/PPTX export

## What's implemented

- **Auth & workspaces**: sign up / sign in with email+password (or a magic
  link). Data is scoped to a **workspace** — invite teammates via a
  one-time `/join/{token}` link generated in Settings; anyone who accepts
  it joins the same workspace and sees the same data. Workspaces can be
  renamed (Settings); switching between multiple workspaces is supported
  via the sidebar's workspace switcher.
- **Projects spreadsheet** (`/projects`): editable grid — name, description,
  category, "Request By", owner, status, priority, start/end dates, actual
  start/end dates (with an on-time/late slippage badge), color (8 presets +
  custom), milestone flag, target goal, mandays, progress %, and
  dependencies ("Depends On" — flags a project as at-risk if it starts
  before a dependency finishes). Add/duplicate/delete rows, bulk
  multi-select edit (status/priority/owner/delete), CSV import and export.
- **Timeline / Swimlane / Kanban views** (`/views`): all auto-generated from
  the spreadsheet via `src/lib/timelineLayout.ts`.
  - **Timeline**: full-year Gantt table, configurable grouping (category/
    request-by/owner/status/priority), milestone markers, a "today" line,
    hover popover (description, mandays, dependency/at-risk info), marquee
    auto-scroll on overflowing text.
  - **Swimlane**: SVG lanes grouped by the same fields.
  - **Kanban**: drag-and-drop status board with a progress bar per card.
- **Priority To-Do** (`/todos`): a separate Eisenhower-matrix to-do list
  (Do / Schedule / Delegate / Eliminate quadrants), independent of the
  roadmap data. Matrix view (drag cards between quadrants) or List view,
  quick capture, due dates, done state. One-click **"→ Roadmap"** (or bulk
  "Add selected to Roadmap") converts a to-do into a roadmap project.
- **Export**: PNG, SVG, PDF, and PPTX via the `ExportMenu` on each roadmap
  view (`src/lib/exportRoadmap.ts`, `exportPptx.ts`); CSV import/export on
  the Projects spreadsheet (`src/lib/importCsv.ts`, `exportCsv.ts`).
- **Filters + saved views**: search and multi-select filters (status,
  priority, request-by, category, owner, date range) via `FilterBar`,
  applied everywhere through `useFilteredProjects()`. Filter sets can be
  named, saved, and re-applied per workspace.
- **Presentation mode** (`/present`, public — no sign-in required):
  fullscreen, sidebar-free view with a Timeline/Swimlane/Kanban switcher,
  fullscreen + dark mode toggles, keyboard shortcuts (←/→ or 1/2/3 to
  switch views, `f` for fullscreen, `Esc` to exit), auto-hiding controls.
  Presenter notes, timer, and laser pointer are not implemented.
- **Shareable read-only snapshots** (`/share/[id]`, public — no sign-in
  required): freeze the current project list into a read-only link from
  Settings. Frozen at creation time; doesn't update with live data.
  Deliberately separate from workspace access — anyone with the link can
  view it.
- **Dashboard** (`/`): status/priority/owner/category breakdowns, upcoming
  milestones (next 90 days), overdue/at-risk list, dependency-risk list,
  on-time delivery %, recently-edited list.
- **Settings** (`/settings`): Supabase connection status, workspace rename,
  teammate invite links, shareable snapshot creation.

## Setup

```bash
cd roadmap-studio
npm install
npm run dev
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_SITE_URL` pins where magic-link/invite emails redirect back to
— without it, the app falls back to the current browser origin, which is
unreliable (e.g. a link requested from a local dev server that isn't
running later will fail). Always set it explicitly per environment.

Run every file in `supabase/migrations/`, **in order**, once in the
Supabase project's SQL Editor (`0001` through the highest-numbered file).
They build up the schema incrementally: initial `projects`/`saved_views`
tables → auth removal/re-addition → field additions (`target_goal`,
`mandays`, `progress`, actual dates, `depends_on`) → `snapshots` →
`todos` → `workspaces`/`workspace_members`/`workspace_invites` → workspace
scoping of existing tables → the RLS cutover from open access to
membership-based access → an RLS infinite-recursion fix → the workspace
rename policy. If you're setting up a brand-new Supabase project, you
still need to run all of them in order (some are corrective and depend on
earlier ones existing).

After running the migrations, sign up in the app once, then run this in
the SQL Editor to create your workspace and claim any pre-existing seed
data (only needed once, when bootstrapping from an already-open dataset):

```sql
do $$
declare
  v_user_id uuid;
  v_workspace_id uuid;
begin
  select id into v_user_id from auth.users where email = 'YOUR_EMAIL_HERE' limit 1;
  insert into workspaces (name, owner_id) values ('My Workspace', v_user_id)
  returning id into v_workspace_id;
  insert into workspace_members (workspace_id, user_id, role)
  values (v_workspace_id, v_user_id, 'owner');
  update projects set workspace_id = v_workspace_id where workspace_id is null;
  update saved_views set workspace_id = v_workspace_id where workspace_id is null;
  update todos set workspace_id = v_workspace_id where workspace_id is null;
end $$;
```

## Deploy (Vercel)

1. Push this repo to GitHub (already done — `chuanhao2002-bot/RoadMap-builder-`).
2. In the Vercel dashboard: **New Project** → import the repo. Framework is
   auto-detected as Next.js.
3. Add environment variables in the Vercel project settings (Settings →
   Environment Variables) — these are gitignored locally, so they must be
   entered manually:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>
   ```
4. In Supabase Auth settings (Authentication → URL Configuration), add the
   Vercel production URL (and any preview-deployment pattern,
   `https://*.vercel.app`) to the allowed redirect URLs.
5. Deploy. Vercel rebuilds automatically on pushes to the connected branch.

## Known gaps

- No presenter notes/timer/laser pointer in Presentation mode.
- Timeline dependency links show an at-risk marker + popover text, not
  drawn connector lines between bars (the table's dynamic row grouping
  makes accurate cross-row line drawing a separate, larger effort).
- No member-removal UI yet (only invite + rename); no role management
  beyond owner/member.
- No AI assistant, no third-party integrations (Jira/Notion/Slack/etc.),
  no version history / audit log on projects.
- Supabase's built-in email sender is rate-limited — password auth is the
  primary sign-in method for this reason; magic link is a fallback only,
  and would need custom SMTP configured in Supabase to be reliable at scale.
