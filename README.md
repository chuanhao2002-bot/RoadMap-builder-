# Roadmap Studio

A spreadsheet-driven roadmap planning tool. The spreadsheet is the single source
of truth — every roadmap visualization is generated from it automatically.

This is a separate Next.js project living in `roadmap-studio/` inside the
Budget-APP repo. It does not share code with the budget app.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Zustand (`src/store/useProjectStore.ts`, `src/store/useFilterStore.ts`) is
  the local cache layer; data is persisted to Supabase Postgres (projects,
  saved views), scoped per-user via RLS, with a Realtime subscription
  keeping the cache in sync
- Supabase client helper at `src/lib/supabase.ts`; auth via email magic link
  (`src/components/auth/AuthGate.tsx`)
- `html-to-image` + `jsPDF` for PNG/SVG/PDF export of the roadmap (`src/lib/exportRoadmap.ts`)

## What's implemented

- **Projects spreadsheet** (`/projects`): editable grid (name, description,
  category, department, owner, status, priority, progress, dates, color,
  milestone, tags). Add/duplicate/delete rows.
- **Timeline / Swimlane / Kanban views** (`/views`): SVG Gantt-style roadmap,
  grouped lanes (by department/category/owner/status/priority), and a
  drag-and-drop status board — all auto-generated from the spreadsheet via
  `src/lib/timelineLayout.ts`.
- **Export**: PNG, SVG, and PDF via the `ExportMenu` on each view (`src/lib/
  exportRoadmap.ts`). Timeline and Swimlane export all three formats; Kanban
  exports PNG/PDF (it's a DOM board, not SVG).
- **Filters + saved views**: search and multi-select filters (status,
  priority, department, category, owner, date range) via `FilterBar`,
  applied everywhere through `useFilteredProjects()`. Filter sets can be
  named, saved, and re-applied (`useFilterStore`, persisted).
- **Presentation mode** (`/present`): fullscreen, sidebar-free view of the
  roadmap with a Timeline/Swimlane/Kanban switcher, fullscreen + dark mode
  toggles, keyboard shortcuts (←/→ or 1/2/3 to switch views, `f` for
  fullscreen, `Esc` to exit), and auto-hiding controls. Reachable via the
  "Present" button on `/views`. Presenter notes, timer, and laser pointer
  are not implemented.
- **Dashboard** (`/`): project counts by status, recently edited list, quick
  links.
- **Settings** (`/settings`): shows Supabase connection status and the
  signed-in account.
- **Auth + persistence**: email magic-link sign-in (`AuthGate`); projects and
  saved views are stored in Supabase Postgres under RLS policies scoped to
  `auth.uid()`, with Zustand as a local cache and Realtime subscriptions on
  both `projects` and `saved_views` keeping them in sync across tabs/sessions.

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
```

Then run `supabase/migrations/0001_init.sql` once in the Supabase project's
SQL Editor to create the `projects` and `saved_views` tables, RLS policies,
and `updated_at` triggers.

## Deploy (Vercel)

1. Push this repo to GitHub (already done for this branch).
2. In the Vercel dashboard: **New Project** → import the repo → set **Root
   Directory** to `roadmap-studio` (it's a subdirectory of the monorepo, not
   the repo root). Framework is auto-detected as Next.js.
3. Add environment variables in the Vercel project settings (Settings →
   Environment Variables) — these are gitignored locally, so they must be
   entered manually, not copied from a committed file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   ```
4. In Supabase Auth settings (Authentication → URL Configuration), add the
   Vercel production URL and any preview-deployment URL pattern
   (`https://*.vercel.app`) to the allowed redirect URLs — magic-link sign-in
   uses `emailRedirectTo: window.location.origin` (see `AuthGate.tsx`), so
   links won't redirect correctly in production until this is set.
5. Deploy. Vercel rebuilds automatically on pushes to the connected branch.

## Known gaps vs. the full spec

This scaffold covers one view (Timeline) and the core spreadsheet → roadmap
loop. The original request described a much larger enterprise product
(real-time multi-user collaboration, AG Grid, 10+ view types, theme designer,
presentation mode, PPTX/PDF export, AI assistant, integrations with Jira/
Notion/Slack/etc., RBAC, version history). None of that is implemented — it
would be a multi-week effort per area. Suggested next milestones, roughly in
order of value:

1. ~~Wire Supabase~~ — done: schema for projects/saved_views, RLS, magic-link
   auth, Zustand as local cache over a Supabase-backed store. No team/org
   sharing yet (single-tenant-per-user RLS model) — that's future work
   alongside RBAC.
2. ~~Add Swimlane and Kanban views~~ — done.
3. ~~Filters + saved views~~ — done.
4. ~~Presentation mode~~ — done (no presenter notes/timer/laser pointer yet).
5. ~~PDF/SVG export~~ — done.
6. ~~Realtime collaboration~~ — done: Realtime subscriptions on `projects`
   and `saved_views` keep the local Zustand cache in sync across tabs/
   sessions for the same signed-in user. True multi-user collaboration
   (presence, shared roadmaps across accounts, live cursors) is still future
   work, gated on team/org sharing (see item 1's RLS note).
