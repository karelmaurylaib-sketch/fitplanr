-- Save Progress: one row each time someone leaving the setup flow asks for a resume link.
create table if not exists public.progress_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  step int not null check (step between 1 and 20),
  total int not null check (total between 1 and 20),
  trigger text not null check (trigger in ('close', 'exit', 'back')),
  device text not null check (device in ('phone', 'computer')),
  created_at timestamptz not null default now()
);
create index if not exists progress_saves_user_idx on public.progress_saves(user_id, created_at desc);

alter table public.progress_saves enable row level security;
create policy "own saves read" on public.progress_saves for select using (auth.uid() = user_id);
create policy "own saves insert" on public.progress_saves for insert with check (auth.uid() = user_id);
create policy "own saves delete" on public.progress_saves for delete using (auth.uid() = user_id);
