create table if not exists snapshots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  data jsonb not null
);

alter table snapshots enable row level security;

drop policy if exists "snapshots_select" on snapshots;
create policy "snapshots_select" on snapshots for select using (true);

drop policy if exists "snapshots_insert" on snapshots;
create policy "snapshots_insert" on snapshots for insert with check (true);

grant select, insert on snapshots to anon;
