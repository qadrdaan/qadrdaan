
-- Verse of the Day
CREATE TABLE public.verse_of_the_day (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author text,
  source_language text NOT NULL DEFAULT 'Urdu',
  translations jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_date date NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.verse_of_the_day ENABLE ROW LEVEL SECURITY;
CREATE POLICY "VOTD viewable by everyone" ON public.verse_of_the_day FOR SELECT USING (true);
CREATE POLICY "Admins manage VOTD" ON public.verse_of_the_day FOR ALL USING (has_role(auth.uid(),'admin'));

-- Creator Tiers
CREATE TYPE public.creator_tier AS ENUM ('bronze','silver','gold','platinum');
CREATE TABLE public.creator_tiers (
  user_id uuid PRIMARY KEY,
  tier creator_tier NOT NULL DEFAULT 'bronze',
  points integer NOT NULL DEFAULT 0,
  monthly_benefit_credit numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.creator_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tiers viewable by everyone" ON public.creator_tiers FOR SELECT USING (true);
CREATE POLICY "Users insert own tier" ON public.creator_tiers FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "Admins update tiers" ON public.creator_tiers FOR UPDATE USING (has_role(auth.uid(),'admin'));

-- Notification preferences
CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY,
  reactions boolean NOT NULL DEFAULT true,
  gifts boolean NOT NULL DEFAULT true,
  comments boolean NOT NULL DEFAULT true,
  follows boolean NOT NULL DEFAULT true,
  mushaira boolean NOT NULL DEFAULT true,
  competitions boolean NOT NULL DEFAULT true,
  preferred_language text NOT NULL DEFAULT 'en',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own prefs" ON public.notification_preferences FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "Users insert own prefs" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "Users update own prefs" ON public.notification_preferences FOR UPDATE USING (auth.uid()=user_id);

-- Mentorship sessions
CREATE TABLE public.mentorship_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  mentee_id uuid NOT NULL,
  topic text,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  price_coins integer NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view sessions" ON public.mentorship_sessions FOR SELECT USING (auth.uid() IN (mentor_id,mentee_id));
CREATE POLICY "Mentees book sessions" ON public.mentorship_sessions FOR INSERT WITH CHECK (auth.uid()=mentee_id);
CREATE POLICY "Mentors update own sessions" ON public.mentorship_sessions FOR UPDATE USING (auth.uid()=mentor_id);

-- Post tagging
ALTER TABLE public.poetry_posts ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.poetry_posts ADD COLUMN IF NOT EXISTS feeling text;
