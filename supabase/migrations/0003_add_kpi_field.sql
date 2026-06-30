-- Add a single open-text KPI field per project for the redesigned Timeline view.
alter table projects add column if not exists kpi text not null default '';
