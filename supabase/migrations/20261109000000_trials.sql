-- Free trial week: one per email, on any plan, no card.
-- Written by the server only (service role). The person can read their own row, never write it.
-- No foreign key on purpose: deleting the account and signing up again does not give a second free week.
create table if not exists public.trials (
  email text primary key,
  user_id uuid,
  tier text not null check (tier in ('starter', 'pro', 'elite')),
  plan_id int not null,
  plan_name text not null,
  started_at timestamptz not null default now(),
  ends_at timestamptz not null
);
create index if not exists trials_user_idx on public.trials(user_id);
alter table public.trials enable row level security;
drop policy if exists "own trial read" on public.trials;
create policy "own trial read" on public.trials for select using (auth.uid() = user_id);
