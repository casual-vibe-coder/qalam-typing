-- Qalam leaderboard: a chosen display name per user, plus a small public
-- leaderboard table denormalized off it so reads don't need a join across
-- two differently-scoped RLS policies. Shares the Awwal Supabase project
-- (see src/lib/supabase.ts) but everything here is qalam_-prefixed so it
-- can't collide with Awwal's own schema.

create table if not exists qalam_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now(),
  constraint qalam_username_format check (username ~ '^[A-Za-z0-9_]{3,20}$')
);

alter table qalam_profiles enable row level security;

-- Usernames are shown on a public leaderboard, so anyone can read them.
create policy "qalam_profiles are publicly readable"
  on qalam_profiles for select
  using (true);

create policy "users manage their own qalam_profiles row"
  on qalam_profiles for insert
  with check (auth.uid() = user_id);

create policy "users update their own qalam_profiles row"
  on qalam_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Denormalized public leaderboard — username copied in at write time so a
-- public SELECT here never needs to touch a more sensitive table.
create table if not exists qalam_leaderboard (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  xp integer not null default 0,
  lessons_completed integer not null default 0,
  best_wpm integer not null default 0,
  best_accuracy integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table qalam_leaderboard enable row level security;

create policy "qalam_leaderboard is publicly readable"
  on qalam_leaderboard for select
  using (true);

create policy "users upsert their own qalam_leaderboard row"
  on qalam_leaderboard for insert
  with check (auth.uid() = user_id);

create policy "users update their own qalam_leaderboard row"
  on qalam_leaderboard for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
