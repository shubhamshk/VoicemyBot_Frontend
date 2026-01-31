-- ================================================
-- CINEMATIC VOICE AI - USAGE LOGS TABLE
-- ================================================
-- This table is the SINGLE SOURCE OF TRUTH for usage tracking.
-- All audio generation MUST be logged here.
-- This makes it IMPOSSIBLE to bypass limits.
-- ================================================

CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('normal', 'cinematic')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast counting queries
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_mode_date 
ON usage_logs(user_id, mode, created_at);

-- Index for daily queries
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at 
ON usage_logs(created_at);

-- Enable Row Level Security
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own usage logs
CREATE POLICY "Users can view own usage logs"
ON usage_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Only the backend (service role) can insert usage logs
CREATE POLICY "Only backend can insert usage logs"
ON usage_logs
FOR INSERT
WITH CHECK (false); -- Deny all inserts from client

-- Note: Service role bypasses RLS, so backend can still insert

COMMENT ON TABLE usage_logs IS 'Records every single audio generation. Used for daily limit enforcement.';
COMMENT ON COLUMN usage_logs.user_id IS 'Foreign key to auth.users';
COMMENT ON COLUMN usage_logs.mode IS 'Either "normal" or "cinematic"';
COMMENT ON COLUMN usage_logs.created_at IS 'Timestamp of audio generation';
