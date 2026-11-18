-- Nutrition & Meal Scan. RLS on every table: a user only sees and changes their own rows.

create table if not exists public.nutrition_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  body jsonb not null,
  choices jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- One row per photo sent to the AI (counted against the plan's monthly scan quota). Photos are never stored.
create table if not exists public.meal_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists meal_scans_user_idx on public.meal_scans(user_id, created_at desc);

create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  eaten_on date not null,
  meal text not null check (meal in ('breakfast', 'lunch', 'dinner', 'snack')),
  title text not null,
  items jsonb not null default '[]'::jsonb,
  kcal int not null check (kcal between 0 and 10000),
  protein int not null check (protein between 0 and 1000),
  carbs int not null check (carbs between 0 and 1500),
  fat int not null check (fat between 0 and 1000),
  source text not null check (source in ('scan', 'plan', 'manual')),
  scan_id uuid references public.meal_scans(id) on delete set null,
  share_id text unique,
  created_at timestamptz not null default now()
);
create index if not exists food_logs_user_idx on public.food_logs(user_id, eaten_on desc);

alter table public.nutrition_profiles enable row level security;
alter table public.meal_scans enable row level security;
alter table public.food_logs enable row level security;

create policy "own nutrition read" on public.nutrition_profiles for select using (auth.uid() = user_id);
create policy "own nutrition insert" on public.nutrition_profiles for insert with check (auth.uid() = user_id);
create policy "own nutrition update" on public.nutrition_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own nutrition delete" on public.nutrition_profiles for delete using (auth.uid() = user_id);

create policy "own scans read" on public.meal_scans for select using (auth.uid() = user_id);
create policy "own scans insert" on public.meal_scans for insert with check (auth.uid() = user_id);
create policy "own scans delete" on public.meal_scans for delete using (auth.uid() = user_id);

create policy "own food read" on public.food_logs for select using (auth.uid() = user_id);
create policy "own food insert" on public.food_logs for insert with check (auth.uid() = user_id);
create policy "own food update" on public.food_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own food delete" on public.food_logs for delete using (auth.uid() = user_id);
