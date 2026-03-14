
-- Content reports table
CREATE TABLE public.content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  content_type text NOT NULL, -- 'post', 'video', 'book', 'profile', 'comment'
  content_id uuid NOT NULL,
  reported_user_id uuid NOT NULL,
  reason text NOT NULL, -- 'spam', 'harassment', 'inappropriate', 'plagiarism', 'fake_account', 'other'
  description text,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'action_taken', 'dismissed'
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit reports" ON public.content_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON public.content_reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON public.content_reports
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports" ON public.content_reports
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Verification requests table
CREATE TABLE public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  reason text NOT NULL,
  portfolio_links text,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  UNIQUE(user_id, status)
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit verification" ON public.verification_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own requests" ON public.verification_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests" ON public.verification_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests" ON public.verification_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Watch time tracking table for monetization eligibility
CREATE TABLE public.watch_time_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid NOT NULL,
  creator_id uuid NOT NULL,
  content_type text NOT NULL, -- 'video', 'post'
  content_id uuid NOT NULL,
  watch_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.watch_time_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert watch time" ON public.watch_time_tracking
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "Users can view own watch time" ON public.watch_time_tracking
  FOR SELECT TO authenticated USING (auth.uid() = viewer_id);

CREATE POLICY "Creators can view their watch time" ON public.watch_time_tracking
  FOR SELECT TO authenticated USING (auth.uid() = creator_id);

CREATE POLICY "Admins can view all watch time" ON public.watch_time_tracking
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create index for monetization eligibility queries
CREATE INDEX idx_watch_time_creator ON public.watch_time_tracking(creator_id, created_at);
CREATE INDEX idx_content_reports_status ON public.content_reports(status);
CREATE INDEX idx_verification_requests_status ON public.verification_requests(status);
