-- Migration: Add per-user voice credit limit columns
-- These allow each plan tier to have its own stored limit:
--   free    → normal=50,  cinematic=10  (default, existing users untouched)
--   pro     → normal=500, cinematic=200 (written by activate-plan edge function on purchase)
--   ultra   → normal=NULL, cinematic=NULL (NULL = unlimited)

-- Add columns (safe: IF NOT EXISTS avoids errors on re-runs)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS normal_voice_limit int DEFAULT 50,
  ADD COLUMN IF NOT EXISTS cinematic_voice_limit int DEFAULT 10;

-- Backfill: any existing PRO users that don't yet have limits set
UPDATE public.users
SET
  normal_voice_limit    = 500,
  cinematic_voice_limit = 200
WHERE
  plan = 'pro'
  AND ultra_premium = false
  AND (normal_voice_limit IS NULL OR normal_voice_limit = 50);

-- Backfill: ultra premium users → NULL (unlimited)
UPDATE public.users
SET
  normal_voice_limit    = NULL,
  cinematic_voice_limit = NULL
WHERE
  ultra_premium = true;
