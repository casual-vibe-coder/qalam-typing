-- Analytics leaderboard extension: total characters typed (pure practice
-- volume, independent of skill/progress) and furthest lesson reached
-- ("where they are in their journey"). Existing RLS policies on
-- qalam_leaderboard already cover insert/update of these new columns —
-- they're just more fields on the same owner-writable row.

alter table qalam_leaderboard
  add column if not exists total_chars_typed integer not null default 0;

alter table qalam_leaderboard
  add column if not exists furthest_lesson_index integer not null default -1;
