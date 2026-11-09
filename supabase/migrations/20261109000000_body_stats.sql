-- Muscle Map & Calorie Burn Estimator: the person's body stats (one row per user).
create table if not exists public.body_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sex text not null check (sex in ('male', 'female')),
  weight_lb numeric(5,1) check (weight_lb between 70 and 500),
  age int check (age between 13 and 90),
  updated_at timestamptz not null default now()
);

alter table public.body_stats enable row level security;

drop policy if exists "own body read" on public.body_stats;
drop policy if exists "own body insert" on public.body_stats;
drop policy if exists "own body update" on public.body_stats;
drop policy if exists "own body delete" on public.body_stats;
create policy "own body read" on public.body_stats for select using (auth.uid() = user_id);
create policy "own body insert" on public.body_stats for insert with check (auth.uid() = user_id);
create policy "own body update" on public.body_stats for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own body delete" on public.body_stats for delete using (auth.uid() = user_id);
