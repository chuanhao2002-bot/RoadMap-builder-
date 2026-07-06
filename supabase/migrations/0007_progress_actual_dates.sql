alter table projects add column if not exists progress int not null default 0;
alter table projects add column if not exists actual_start_date date;
alter table projects add column if not exists actual_end_date date;
