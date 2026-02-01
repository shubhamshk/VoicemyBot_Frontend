-- Make url column nullable in waitlist_users table
-- This fixes the "null value in column \"url\" violates not-null constraint" error
ALTER TABLE waitlist_users 
ALTER COLUMN url DROP NOT NULL;
