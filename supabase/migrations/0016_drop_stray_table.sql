-- A stray junk table named after a GitHub URL
-- ("https://github.com/chuanhao2002-bot/Budget-APP/blob/claude/road", 2 cols,
-- 0 rows) was created accidentally early in the project's history and never
-- belonged to the schema. It was already dropped directly against the live DB
-- via MCP on 2026-07-18; this migration records that cleanup so a fresh setup
-- (or the migration history) doesn't reintroduce or expect it. Idempotent.
drop table if exists public."https://github.com/chuanhao2002-bot/Budget-APP/blob/claude/road";
