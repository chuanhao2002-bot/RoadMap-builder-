-- Fix infinite-recursion RLS bug: workspace_members_select queried
-- workspace_members from inside its own policy, which Postgres detects as
-- recursion and blocks — cascading failures into every policy that checks
-- membership (workspaces, projects, saved_views, todos, invites).
--
-- Fix: a SECURITY DEFINER helper function bypasses RLS internally, so
-- membership checks no longer trigger the policy recursively.

create or replace function is_workspace_member(ws_id uuid) returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
  );
$$;

create or replace function is_workspace_owner(ws_id uuid) returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from workspaces
    where id = ws_id and owner_id = auth.uid()
  );
$$;

-- workspace_members
drop policy if exists "workspace_members_select" on workspace_members;
create policy "workspace_members_select" on workspace_members for select
  using (is_workspace_member(workspace_id));

drop policy if exists "workspace_members_insert" on workspace_members;
create policy "workspace_members_insert" on workspace_members for insert
  with check (user_id = auth.uid() or is_workspace_owner(workspace_id));

drop policy if exists "workspace_members_delete" on workspace_members;
create policy "workspace_members_delete" on workspace_members for delete
  using (is_workspace_owner(workspace_id));

-- workspaces
drop policy if exists "workspaces_select" on workspaces;
create policy "workspaces_select" on workspaces for select
  using (is_workspace_member(id));

-- workspace_invites
drop policy if exists "workspace_invites_insert" on workspace_invites;
create policy "workspace_invites_insert" on workspace_invites for insert
  with check (is_workspace_member(workspace_id));

-- projects
drop policy if exists "projects_ws_select" on projects;
drop policy if exists "projects_ws_insert" on projects;
drop policy if exists "projects_ws_update" on projects;
drop policy if exists "projects_ws_delete" on projects;

create policy "projects_ws_select" on projects for select using (is_workspace_member(workspace_id));
create policy "projects_ws_insert" on projects for insert with check (is_workspace_member(workspace_id));
create policy "projects_ws_update" on projects for update
  using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
create policy "projects_ws_delete" on projects for delete using (is_workspace_member(workspace_id));

-- saved_views
drop policy if exists "saved_views_ws_select" on saved_views;
drop policy if exists "saved_views_ws_insert" on saved_views;
drop policy if exists "saved_views_ws_update" on saved_views;
drop policy if exists "saved_views_ws_delete" on saved_views;

create policy "saved_views_ws_select" on saved_views for select using (is_workspace_member(workspace_id));
create policy "saved_views_ws_insert" on saved_views for insert with check (is_workspace_member(workspace_id));
create policy "saved_views_ws_update" on saved_views for update
  using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
create policy "saved_views_ws_delete" on saved_views for delete using (is_workspace_member(workspace_id));

-- todos
drop policy if exists "todos_ws_select" on todos;
drop policy if exists "todos_ws_insert" on todos;
drop policy if exists "todos_ws_update" on todos;
drop policy if exists "todos_ws_delete" on todos;

create policy "todos_ws_select" on todos for select using (is_workspace_member(workspace_id));
create policy "todos_ws_insert" on todos for insert with check (is_workspace_member(workspace_id));
create policy "todos_ws_update" on todos for update
  using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
create policy "todos_ws_delete" on todos for delete using (is_workspace_member(workspace_id));
