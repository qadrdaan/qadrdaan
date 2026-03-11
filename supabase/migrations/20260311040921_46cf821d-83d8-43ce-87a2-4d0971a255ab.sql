
-- Post impressions tracking for equal start reach
CREATE TABLE public.post_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.poetry_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  reading_time_seconds integer NOT NULL DEFAULT 0,
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.post_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Impressions viewable by everyone" ON public.post_impressions FOR SELECT USING (true);
CREATE POLICY "Auth users can record impressions" ON public.post_impressions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own impressions" ON public.post_impressions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Post shares tracking
CREATE TABLE public.post_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.poetry_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shares viewable by everyone" ON public.post_shares FOR SELECT USING (true);
CREATE POLICY "Auth users can share" ON public.post_shares FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Add discovery columns to poetry_posts
ALTER TABLE public.poetry_posts
  ADD COLUMN IF NOT EXISTS impressions_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shares_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reading_time integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engagement_score numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_editor_pick boolean NOT NULL DEFAULT false;

-- Add language preference to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_languages text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_genres text[] DEFAULT '{}';

-- Trigger: update impressions_count on poetry_posts
CREATE OR REPLACE FUNCTION public.update_post_impressions_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.poetry_posts SET impressions_count = impressions_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_impression_insert
  AFTER INSERT ON public.post_impressions
  FOR EACH ROW EXECUTE FUNCTION public.update_post_impressions_count();

-- Trigger: update shares_count on poetry_posts
CREATE OR REPLACE FUNCTION public.update_post_shares_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.poetry_posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_share_insert
  AFTER INSERT ON public.post_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_post_shares_count();

-- Function: recalculate engagement score
CREATE OR REPLACE FUNCTION public.recalculate_engagement_score(p_post_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_reading_time integer;
  v_likes integer;
  v_comments integer;
  v_shares integer;
  v_score numeric;
BEGIN
  SELECT COALESCE(SUM(reading_time_seconds), 0) INTO v_reading_time FROM public.post_impressions WHERE post_id = p_post_id;
  SELECT likes_count, comments_count, shares_count INTO v_likes, v_comments, v_shares FROM public.poetry_posts WHERE id = p_post_id;
  v_score := (v_reading_time * 3) + (v_likes * 2) + (v_comments * 2) + (v_shares * 1);
  UPDATE public.poetry_posts SET engagement_score = v_score, total_reading_time = v_reading_time WHERE id = p_post_id;
END;
$$;

-- Enable realtime for post_impressions
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_impressions;
