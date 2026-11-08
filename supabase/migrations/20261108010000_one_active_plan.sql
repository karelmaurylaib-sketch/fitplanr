-- At most one active plan per user (prevents duplicate plans from double requests).
update public.plans p set is_active = false
where is_active and exists (select 1 from public.plans q where q.user_id = p.user_id and q.is_active and q.created_at > p.created_at);
create unique index if not exists plans_one_active on public.plans(user_id) where is_active;
