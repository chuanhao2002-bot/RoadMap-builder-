alter table projects add column if not exists workspace_id uuid references workspaces(id) on delete cascade;
alter table saved_views add column if not exists workspace_id uuid references workspaces(id) on delete cascade;
alter table todos add column if not exists workspace_id uuid references workspaces(id) on delete cascade;
alter table snapshots add column if not exists created_by uuid references auth.users(id) on delete set null;
