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
- **Timeline view** (`/views`): SVG Gantt-style roadmap auto-generated from
  the spreadsheet — bar position/width derived from dates, progress fill,
  milestone flags, month gridlines. PNG export button.
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
   cache layer).
2. Add Swimlane and Kanban views (straightforward reuse of the same data
   model, different layout function).
3. Filters + saved views (client-side filtering of the existing project list,
   persisted as named filter sets).
4. Presentation mode (a route that hides the sidebar/toolbar and renders only
   the active view fullscreen).
5. PDF/SVG export alongside the existing PNG export (`jsPDF` is already
   installed).
6. Realtime collaboration via Supabase Realtime once the backend exists.
