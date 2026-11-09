-- Free trial: one per account, Starter and Pro only (never Elite). 7 days from the moment the card is entered.
-- Users can read their own row; only the server (service role) writes, so a trial can't be reset from the browser.

create table if not exists public.trials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id int not null,
  tier text not null check (tier in ('starter', 'pro')),
  period text not null check (period in ('month', 'year')),
  ref text,
  days int not null default 7 check (days between 1 and 30),
  status text not null default 'pending' check (status in ('pending', 'active', 'canceled', 'converted')),
  price_cents int not null check (price_cents >= 0),
  started_at timestamptz,
  ends_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ends_at is always started_at + days: set by the database, never trusted from the caller.
create or replace function public.trials_set_ends_at() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if new.started_at is not null then
    new.ends_at := new.started_at + make_interval(days => new.days);
  else
    new.ends_at := null;
  end if;
  return new;
end $$;

drop trigger if exists trials_ends_at on public.trials;
create trigger trials_ends_at before insert or update on public.trials
  for each row execute function public.trials_set_ends_at();

alter table public.trials enable row level security;
drop policy if exists "own trial read" on public.trials;
create policy "own trial read" on public.trials for select using (auth.uid() = user_id);
