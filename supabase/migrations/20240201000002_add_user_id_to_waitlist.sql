-- Add user_id column to waitlist_users table
ALTER TABLE waitlist_users 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_waitlist_users_user_id ON waitlist_users(user_id);

-- Update the RLS policy to allow authenticated users to insert their own records
DO $$
BEGIN
    -- Drop old policy if exists
    DROP POLICY IF EXISTS "Allow public insert to waitlist_users" ON waitlist_users;
    
    -- Create new policy for authenticated users
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated users to insert waitlist') THEN
        CREATE POLICY "Allow authenticated users to insert waitlist"
        ON waitlist_users FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    -- Also allow public inserts without user_id (for backwards compatibility)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert without user_id') THEN
        CREATE POLICY "Allow public insert without user_id"
        ON waitlist_users FOR INSERT
        TO public
        WITH CHECK (user_id IS NULL);
    END IF;
END$$;
