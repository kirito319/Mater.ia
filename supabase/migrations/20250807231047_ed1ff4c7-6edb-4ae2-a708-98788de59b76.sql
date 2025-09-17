-- Atomic AI usage increment function
create or replace function public.increment_ai_usage(p_month_year text)
returns integer
language sql
as $$
insert into public.user_ai_usage (user_id, month_year, usage_count)
values (auth.uid(), p_month_year, 1)
on conflict (user_id, month_year)
do update set usage_count = public.user_ai_usage.usage_count + 1
returning usage_count;
$$;

-- Allow authenticated users to execute
grant execute on function public.increment_ai_usage(text) to authenticated;