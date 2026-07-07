create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text not null default '',
  urgent boolean not null default false,
  important boolean not null default true,
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table todos enable row level security;

drop policy if exists "todos_select" on todos;
create policy "todos_select" on todos for select using (true);

drop policy if exists "todos_insert" on todos;
create policy "todos_insert" on todos for insert with check (true);

drop policy if exists "todos_update" on todos;
create policy "todos_update" on todos for update using (true) with check (true);

drop policy if exists "todos_delete" on todos;
create policy "todos_delete" on todos for delete using (true);

grant select, insert, update, delete on todos to anon;

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists todos_updated_at on todos;
create trigger todos_updated_at before update on todos
  for each row execute function set_updated_at();
