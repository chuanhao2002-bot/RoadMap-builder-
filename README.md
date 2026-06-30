# Roadmap Studio

A spreadsheet-driven roadmap planning tool. The spreadsheet is the single source
of truth — every roadmap visualization is generated from it automatically.

This is a separate Next.js project living in `roadmap-studio/` inside the
Budget-APP repo. It does not share code with the budget app.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Zustand (`src/store/useProjectStore.ts`) holds project data, persisted to
  `localStorage` for now
- Supabase client helper at `src/lib/supabase.ts`, not yet wired to a real
  project (no auth, no realtime sync, no RLS schema yet)
- `html-to-image` for PNG export of the SVG roadmap

## What's implemented

- **Projects spreadsheet** (`/projects`): editable grid (name, description,
  category, department, owner, status, priority, progress, dates, color,
  milestone, tags). Add/duplicate/delete rows.
- **Timeline / Swimlane / Kanban views** (`/views`): SVG Gantt-style roadmap,
  grouped lanes (by department/category/owner/status/priority), and a
  drag-and-drop status board — all auto-generated from the spreadsheet via
  `src/lib/timelineLayout.ts`. PNG export on Timeline/Swimlane.
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
- **Settings** (`/settings`): placeholder for Supabase env vars.

## Setup

```bash
cd roadmap-studio
npm install
npm run dev
```

To connect a real backend later, create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Known gaps vs. the full spec

This scaffold covers one view (Timeline) and the core spreadsheet → roadmap
loop. The original request described a much larger enterprise product
(real-time multi-user collaboration, AG Grid, 10+ view types, theme designer,
presentation mode, PPTX/PDF export, AI assistant, integrations with Jira/
Notion/Slack/etc., RBAC, version history). None of that is implemented — it
would be a multi-week effort per area. Suggested next milestones, roughly in
order of value:

1. Wire Supabase: schema for projects/views/orgs, auth, RLS, replace the
   Zustand-only store with a Supabase-backed one (keep Zustand as the local
   cache layer). Needs real Supabase credentials.
2. ~~Add Swimlane and Kanban views~~ — done.
3. ~~Filters + saved views~~ — done.
4. ~~Presentation mode~~ — done (no presenter notes/timer/laser pointer yet).
5. PDF/SVG export alongside the existing PNG export (`jsPDF` is already
   installed).
6. Realtime collaboration via Supabase Realtime once the backend exists.
