-- Existing users table (ensuring it's there from previous step)
create table if not exists public.users (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  avatar_url text,
  plan text default 'free', -- 'free' | 'pro'
  ultra_premium boolean default false,
  -- Deprecated/Legacy counters in users table can be ignored or removed in favor of usage_daily
  -- Keeping them for now to avoid breaking previous code if any
  normal_voice_count_today int default 0,
  cinematic_voice_count_today int default 0,
  last_reset_date date default current_date
);

-- NEW: Usage Daily Table
create table if not exists public.usage_daily (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  date date default current_date not null,
  normal_used int default 0,
  cinematic_used int default 0,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- RLS for usage_daily
alter table public.usage_daily enable row level security;

-- Policies
-- Clients can READ their own usage
DROP POLICY IF EXISTS "Users can read own daily usage" ON public.usage_daily;
create policy "Users can read own daily usage" on public.usage_daily
  for select using (auth.uid() = user_id);

-- Clients CANNOT write (Insert/Update/Delete) - denied by default if no policy exists
-- Only Service Role (Edge Functions) can write. Service Role bypasses RLS.

-- Index for performance
create index if not exists idx_usage_daily_user_date on public.usage_daily(user_id, date);
