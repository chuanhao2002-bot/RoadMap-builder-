alter table projects add column if not exists depends_on text[] not null default '{}';
