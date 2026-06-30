-- Roadmap Studio: projects + saved_views, scoped to the signed-in user.
create extension if not exists pgcrypto;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  description text,
  category text,
  department text,
  owner text,
  status text not null default 'Planning'
    check (status in ('Planning', 'In Progress', 'Blocked', 'Completed')),
  priority text not null default 'Medium'
    check (priority in ('Low', 'Medium', 'High', 'Critical')),
  progress int not null default 0 check (progress between 0 and 100),
  start_date date,
  end_date date,
  color text,
  milestone boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists saved_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on projects (user_id);
create index if not exists saved_views_user_id_idx on saved_views (user_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists projects_set_updated_at on projects;
create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

drop trigger if exists saved_views_set_updated_at on saved_views;
create trigger saved_views_set_updated_at
  before update on saved_views
  for each row execute function set_updated_at();

alter table projects enable row level security;
alter table saved_views enable row level security;

drop policy if exists "projects_select_own" on projects;
create policy "projects_select_own" on projects
  for select using (auth.uid() = user_id);

drop policy if exists "projects_insert_own" on projects;
create policy "projects_insert_own" on projects
  for insert with check (auth.uid() = user_id);

drop policy if exists "projects_update_own" on projects;
create policy "projects_update_own" on projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "projects_delete_own" on projects;
create policy "projects_delete_own" on projects
  for delete using (auth.uid() = user_id);

drop policy if exists "saved_views_select_own" on saved_views;
create policy "saved_views_select_own" on saved_views
  for select using (auth.uid() = user_id);

drop policy if exists "saved_views_insert_own" on saved_views;
create policy "saved_views_insert_own" on saved_views
  for insert with check (auth.uid() = user_id);

drop policy if exists "saved_views_update_own" on saved_views;
create policy "saved_views_update_own" on saved_views
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "saved_views_delete_own" on saved_views;
create policy "saved_views_delete_own" on saved_views
  for delete using (auth.uid() = user_id);
