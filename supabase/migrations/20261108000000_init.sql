-- FitPlanr schema. Row Level Security on every table: a user only sees and changes their own rows.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  answers jsonb not null default '{}'::jsonb,
  k text,
  intended_plan text,
  source text,
  units text not null default 'lb',
  onboarded boolean not null default false,
  unlocked_seen boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  inputs jsonb not null,
  options jsonb not null default '{}'::jsonb,
  data jsonb not null,
  is_active boolean not null default true,
  share_id text unique,
  created_at timestamptz not null default now()
);
create index if not exists plans_user_idx on public.plans(user_id, created_at desc);

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  week int not null check (week between 1 and 4),
  day int not null check (day between 1 and 7),
  day_name text,
  entries jsonb not null default '[]'::jsonb,
  notes text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists logs_user_idx on public.workout_logs(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.workout_logs enable row level security;

create policy "own profile read" on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile delete" on public.profiles for delete using (auth.uid() = id);

create policy "own plans read" on public.plans for select using (auth.uid() = user_id);
create policy "own plans insert" on public.plans for insert with check (auth.uid() = user_id);
create policy "own plans update" on public.plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own plans delete" on public.plans for delete using (auth.uid() = user_id);

create policy "own logs read" on public.workout_logs for select using (auth.uid() = user_id);
create policy "own logs insert" on public.workout_logs for insert with check (auth.uid() = user_id);
create policy "own logs update" on public.workout_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own logs delete" on public.workout_logs for delete using (auth.uid() = user_id);

-- A profile row for every new account.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
