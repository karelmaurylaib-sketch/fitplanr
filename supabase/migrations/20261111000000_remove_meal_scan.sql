-- The meal photo scan was removed from FitPlanr (owner decision, Nov 11, 2026).
-- Food logs now only come from "Ate it" on a planned meal. Only test-account rows existed for the other sources.
delete from public.food_logs where source <> 'plan';
alter table public.food_logs drop column if exists scan_id;
alter table public.food_logs drop column if exists share_id;
alter table public.food_logs drop constraint if exists food_logs_source_check;
alter table public.food_logs add constraint food_logs_source_check check (source = 'plan');
drop table if exists public.meal_scans;
