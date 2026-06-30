-- Remove sign-in requirement: app is now a single shared workspace, open to anyone with the URL.
alter table projects drop constraint if exists projects_user_id_fkey;
alter table projects alter column user_id drop not null;
alter table projects alter column user_id drop default;

alter table saved_views drop constraint if exists saved_views_user_id_fkey;
alter table saved_views alter column user_id drop not null;
alter table saved_views alter column user_id drop default;

drop policy if exists "projects_select_own" on projects;
drop policy if exists "projects_insert_own" on projects;
drop policy if exists "projects_update_own" on projects;
drop policy if exists "projects_delete_own" on projects;

create policy "projects_open_select" on projects for select using (true);
create policy "projects_open_insert" on projects for insert with check (true);
create policy "projects_open_update" on projects for update using (true) with check (true);
create policy "projects_open_delete" on projects for delete using (true);

drop policy if exists "saved_views_select_own" on saved_views;
drop policy if exists "saved_views_insert_own" on saved_views;
drop policy if exists "saved_views_update_own" on saved_views;
drop policy if exists "saved_views_delete_own" on saved_views;

create policy "saved_views_open_select" on saved_views for select using (true);
create policy "saved_views_open_insert" on saved_views for insert with check (true);
create policy "saved_views_open_update" on saved_views for update using (true) with check (true);
create policy "saved_views_open_delete" on saved_views for delete using (true);

grant select, insert, update, delete on projects to anon;
grant select, insert, update, delete on saved_views to anon;
