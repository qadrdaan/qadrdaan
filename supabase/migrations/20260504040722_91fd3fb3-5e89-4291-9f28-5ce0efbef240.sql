-- Add reaction_type to post_likes
ALTER TABLE public.post_likes
  ADD COLUMN IF NOT EXISTS reaction_type text NOT NULL DEFAULT 'heart';

-- Stories: 24 hour ephemeral
CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  media_url text,
  media_type text NOT NULL DEFAULT 'image', -- image|video|text
  caption text,
  background_color text,
  views_count integer NOT NULL DEFAULT 0,
  reactions_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stories_creator ON public.stories(creator_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires ON public.stories(expires_at);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stories viewable while not expired"
  ON public.stories FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Users create own stories"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators delete own stories"
  ON public.stories FOR DELETE
  USING (auth.uid() = creator_id);

-- Story views
CREATE TABLE IF NOT EXISTS public.story_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own views"
  ON public.story_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Story owner sees views"
  ON public.story_views FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT creator_id FROM public.stories WHERE id = story_id)
  );

-- Story reactions
CREATE TABLE IF NOT EXISTS public.story_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('heart','thumbsup','care','sad','angry')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

ALTER TABLE public.story_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Story reactions viewable by everyone"
  ON public.story_reactions FOR SELECT USING (true);

CREATE POLICY "Users react to stories"
  ON public.story_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reaction"
  ON public.story_reactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users remove own reaction"
  ON public.story_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers to maintain counts
CREATE OR REPLACE FUNCTION public.update_story_views_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.stories SET views_count = views_count + 1 WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_story_view ON public.story_views;
CREATE TRIGGER trg_story_view AFTER INSERT ON public.story_views
FOR EACH ROW EXECUTE FUNCTION public.update_story_views_count();

CREATE OR REPLACE FUNCTION public.update_story_reactions_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.stories SET reactions_count = reactions_count + 1 WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.stories SET reactions_count = GREATEST(reactions_count - 1, 0) WHERE id = OLD.story_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_story_reaction ON public.story_reactions;
CREATE TRIGGER trg_story_reaction AFTER INSERT OR DELETE ON public.story_reactions
FOR EACH ROW EXECUTE FUNCTION public.update_story_reactions_count();