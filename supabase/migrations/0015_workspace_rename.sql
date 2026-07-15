-- workspaces had no UPDATE policy at all — renaming was impossible even for
-- the owner. Restrict renaming to the workspace owner.
drop policy if exists "workspaces_update" on workspaces;
create policy "workspaces_update" on workspaces for update
  using (is_workspace_owner(id))
  with check (is_workspace_owner(id));

grant update on workspaces to authenticated;
