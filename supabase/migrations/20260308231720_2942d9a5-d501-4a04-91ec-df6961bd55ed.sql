
-- Poetry Posts
CREATE TABLE public.poetry_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'ghazal',
  language text,
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  gifts_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.poetry_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Poetry posts viewable by everyone" ON public.poetry_posts FOR SELECT USING (true);
CREATE POLICY "Creators can insert posts" ON public.poetry_posts FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own posts" ON public.poetry_posts FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete own posts" ON public.poetry_posts FOR DELETE USING (auth.uid() = creator_id);

-- Post Likes
CREATE TABLE public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.poetry_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Post likes viewable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Post Comments
CREATE TABLE public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.poetry_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Post comments viewable by everyone" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks
CREATE TABLE public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Poetry Challenges
CREATE TABLE public.poetry_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  theme text,
  language text,
  created_by uuid NOT NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.poetry_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenges viewable by everyone" ON public.poetry_challenges FOR SELECT USING (true);
CREATE POLICY "Auth users can create challenges" ON public.poetry_challenges FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update own challenges" ON public.poetry_challenges FOR UPDATE USING (auth.uid() = created_by);

-- Challenge Entries
CREATE TABLE public.challenge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.poetry_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  votes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);
ALTER TABLE public.challenge_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenge entries viewable by everyone" ON public.challenge_entries FOR SELECT USING (true);
CREATE POLICY "Auth users can submit entries" ON public.challenge_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON public.challenge_entries FOR DELETE USING (auth.uid() = user_id);

-- Referrals / Invitations
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid NOT NULL,
  invite_code text NOT NULL UNIQUE,
  invited_email text,
  invited_user_id uuid,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invited_user_id);
CREATE POLICY "Users can create referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = inviter_id);
CREATE POLICY "Users can update own referrals" ON public.referrals FOR UPDATE USING (auth.uid() = inviter_id);

-- Add cover_image and following_count to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count integer NOT NULL DEFAULT 0;

-- Triggers for post likes count
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.poetry_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.poetry_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_post_like_change
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

-- Trigger for following count
CREATE OR REPLACE FUNCTION public.update_following_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET following_count = following_count + 1 WHERE user_id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET following_count = GREATEST(following_count - 1, 0) WHERE user_id = OLD.follower_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_follow_change_following
AFTER INSERT OR DELETE ON public.followers
FOR EACH ROW EXECUTE FUNCTION public.update_following_count();

-- Trigger for post comments count
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.poetry_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.poetry_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_post_comment_change
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();
