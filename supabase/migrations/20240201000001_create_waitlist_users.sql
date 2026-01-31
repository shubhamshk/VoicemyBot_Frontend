-- Create enum for payment status
create type payment_status_type as enum ('paid', 'skipped');

-- Create waitlist_users table
create table waitlist_users (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  url text not null,
  contribution_amount numeric, -- nullable because skipped means no amount, or maybe 0? User said "skipped", implying no payment.
  payment_status payment_status_type not null,
  platform text default 'paypal',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table waitlist_users enable row level security;

-- Policies

-- Allow anyone to insert (public waitlist form)
create policy "Allow public insert to waitlist_users"
on waitlist_users for insert
with check (true);

-- Allow service role to view/manage (admin dashboard)
create policy "Allow service role to manage waitlist_users"
on waitlist_users for all
using (auth.role() = 'service_role');
