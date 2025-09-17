-- Harden increment_ai_usage with security definer and fixed search_path
create or replace function public.increment_ai_usage(p_month_year text)
returns integer
language sql
security definer
set search_path to ''
as $$
insert into public.user_ai_usage (user_id, month_year, usage_count)
values (auth.uid(), p_month_year, 1)
on conflict (user_id, month_year)
do update set usage_count = public.user_ai_usage.usage_count + 1
returning usage_count;
$$;

-- Ensure execute permission remains for authenticated users
grant execute on function public.increment_ai_usage(text) to authenticated;