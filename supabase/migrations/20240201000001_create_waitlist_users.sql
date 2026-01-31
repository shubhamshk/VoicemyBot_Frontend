-- Create enum for payment status (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_type') THEN
        CREATE TYPE payment_status_type AS ENUM ('paid', 'skipped');
    END IF;
END$$;

-- Create waitlist_users table
CREATE TABLE IF NOT EXISTS waitlist_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  url text,
  contribution_amount numeric,
  payment_status payment_status_type NOT NULL,
  platform text DEFAULT 'paypal',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (idempotent)
ALTER TABLE waitlist_users ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert to waitlist_users') THEN
        CREATE POLICY "Allow public insert to waitlist_users"
        ON waitlist_users FOR INSERT
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service role to manage waitlist_users') THEN
        CREATE POLICY "Allow service role to manage waitlist_users"
        ON waitlist_users FOR ALL
        USING (auth.role() = 'service_role');
    END IF;
END$$;
