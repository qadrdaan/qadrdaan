
-- Table to track user violations and strikes
CREATE TABLE public.user_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  violation_type text NOT NULL DEFAULT 'content_moderation',
  content_type text NOT NULL, -- 'post', 'comment', 'live_chat'
  content_text text,
  ai_reason text,
  strike_number integer NOT NULL DEFAULT 1,
  action_taken text NOT NULL DEFAULT 'warning', -- 'warning', 'temp_suspension', 'permanent_ban'
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_violations ENABLE ROW LEVEL SECURITY;

-- Users can view their own violations
CREATE POLICY "Users can view own violations" ON public.user_violations
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Only admins can insert violations (via service role from edge function)
-- The edge function uses service role key so no INSERT policy needed for regular users

-- Admins can view all violations
CREATE POLICY "Admins can view all violations" ON public.user_violations
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add suspension fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspended_until timestamptz,
  ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS strike_count integer NOT NULL DEFAULT 0;
