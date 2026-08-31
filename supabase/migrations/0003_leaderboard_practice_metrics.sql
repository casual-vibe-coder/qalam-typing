-- Metrics for the newer practice-screen features: hadith completed, Qur'an
-- pages completed, and memory-mode ("write it from memory") completions.
-- Same owner-writable qalam_leaderboard row as before — no new policies needed.

alter table qalam_leaderboard
  add column if not exists hadith_completed integer not null default 0;

alter table qalam_leaderboard
  add column if not exists quran_pages_completed integer not null default 0;

alter table qalam_leaderboard
  add column if not exists memory_mode_completions integer not null default 0;
