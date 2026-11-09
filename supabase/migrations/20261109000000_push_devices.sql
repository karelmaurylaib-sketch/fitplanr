-- Native app (Google Play / App Store) push devices. One row per phone; RLS: a user only sees their own.
create table if not exists public.push_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('ios', 'android')),
  token text not null unique check (char_length(token) between 32 and 4096),
  reminders boolean not null default true,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists push_devices_user_idx on public.push_devices(user_id);

alter table public.push_devices enable row level security;

create policy "own devices read" on public.push_devices for select using (auth.uid() = user_id);
create policy "own devices insert" on public.push_devices for insert with check (auth.uid() = user_id);
create policy "own devices update" on public.push_devices for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own devices delete" on public.push_devices for delete using (auth.uid() = user_id);
