-- Run this ONLY after every row in projects/saved_views/todos has a non-null
-- workspace_id (i.e. after the manual claim step). This drops the open
-- anon-accessible policies and replaces them with workspace-membership checks.

-- projects
drop policy if exists "projects_open_select" on projects;
drop policy if exists "projects_open_insert" on projects;
drop policy if exists "projects_open_update" on projects;
drop policy if exists "projects_open_delete" on projects;

create policy "projects_ws_select" on projects for select
  using (exists (select 1 from workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = auth.uid()));
create policy "projects_ws_insert" on projects for insert
  with check (exists (select 1 from workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = auth.uid()));
create policy "projects_ws_update" on projects for update
  using (exists (select 1 from workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = auth.uid()))
  with check (exists (select 1 from workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = auth.uid()));
create policy "projects_ws_delete" on projects for delete
  using (exists (select 1 from workspace_members m where m.workspace_id = projects.workspace_id and m.user_id = auth.uid()));

alter table projects alter column workspace_id set not null;
revoke select, insert, update, delete on projects from anon;
grant select, insert, update, delete on projects to authenticated;

-- saved_views
drop policy if exists "saved_views_open_select" on saved_views;
drop policy if exists "saved_views_open_insert" on saved_views;
drop policy if exists "saved_views_open_update" on saved_views;
drop policy if exists "saved_views_open_delete" on saved_views;

create policy "saved_views_ws_select" on saved_views for select
  using (exists (select 1 from workspace_members m where m.workspace_id = saved_views.workspace_id and m.user_id = auth.uid()));
create policy "saved_views_ws_insert" on saved_views for insert
  with check (exists (select 1 from workspace_members m where m.workspace_id = saved_views.workspace_id and m.user_id = auth.uid()));
create policy "saved_views_ws_update" on saved_views for update
  using (exists (select 1 from workspace_members m where m.workspace_id = saved_views.workspace_id and m.user_id = auth.uid()))
  with check (exists (select 1 from workspace_members m where m.workspace_id = saved_views.workspace_id and m.user_id = auth.uid()));
create policy "saved_views_ws_delete" on saved_views for delete
  using (exists (select 1 from workspace_members m where m.workspace_id = saved_views.workspace_id and m.user_id = auth.uid()));

alter table saved_views alter column workspace_id set not null;
revoke select, insert, update, delete on saved_views from anon;
grant select, insert, update, delete on saved_views to authenticated;

-- todos
drop policy if exists "todos_select" on todos;
drop policy if exists "todos_insert" on todos;
drop policy if exists "todos_update" on todos;
drop policy if exists "todos_delete" on todos;

create policy "todos_ws_select" on todos for select
  using (exists (select 1 from workspace_members m where m.workspace_id = todos.workspace_id and m.user_id = auth.uid()));
create policy "todos_ws_insert" on todos for insert
  with check (exists (select 1 from workspace_members m where m.workspace_id = todos.workspace_id and m.user_id = auth.uid()));
create policy "todos_ws_update" on todos for update
  using (exists (select 1 from workspace_members m where m.workspace_id = todos.workspace_id and m.user_id = auth.uid()))
  with check (exists (select 1 from workspace_members m where m.workspace_id = todos.workspace_id and m.user_id = auth.uid()));
create policy "todos_ws_delete" on todos for delete
  using (exists (select 1 from workspace_members m where m.workspace_id = todos.workspace_id and m.user_id = auth.uid()));

alter table todos alter column workspace_id set not null;
revoke select, insert, update, delete on todos from anon;
grant select, insert, update, delete on todos to authenticated;

-- snapshots stay public/open by design (unauthenticated read-only share links) — no change here.
