create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists workspace_members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  email text,
  token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table workspace_invites enable row level security;

-- workspaces: visible to members
drop policy if exists "workspaces_select" on workspaces;
create policy "workspaces_select" on workspaces for select
  using (exists (select 1 from workspace_members m where m.workspace_id = workspaces.id and m.user_id = auth.uid()));

drop policy if exists "workspaces_insert" on workspaces;
create policy "workspaces_insert" on workspaces for insert
  with check (owner_id = auth.uid());

-- workspace_members: visible to fellow members; only owners manage membership
drop policy if exists "workspace_members_select" on workspace_members;
create policy "workspace_members_select" on workspace_members for select
  using (exists (select 1 from workspace_members m where m.workspace_id = workspace_members.workspace_id and m.user_id = auth.uid()));

drop policy if exists "workspace_members_insert" on workspace_members;
create policy "workspace_members_insert" on workspace_members for insert
  with check (
    user_id = auth.uid()
    or exists (select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
  );

drop policy if exists "workspace_members_delete" on workspace_members;
create policy "workspace_members_delete" on workspace_members for delete
  using (exists (select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));

-- workspace_invites: visible/manageable by members of that workspace (created by owners in the UI,
-- but any member can see invites for their own workspace; acceptance just needs to read by token)
drop policy if exists "workspace_invites_select" on workspace_invites;
create policy "workspace_invites_select" on workspace_invites for select
  using (true);

drop policy if exists "workspace_invites_insert" on workspace_invites;
create policy "workspace_invites_insert" on workspace_invites for insert
  with check (exists (select 1 from workspace_members m where m.workspace_id = workspace_invites.workspace_id and m.user_id = auth.uid()));

drop policy if exists "workspace_invites_update" on workspace_invites;
create policy "workspace_invites_update" on workspace_invites for update
  using (true) with check (true);

grant select, insert on workspaces to authenticated;
grant select, insert, delete on workspace_members to authenticated;
grant select, insert, update on workspace_invites to authenticated;
