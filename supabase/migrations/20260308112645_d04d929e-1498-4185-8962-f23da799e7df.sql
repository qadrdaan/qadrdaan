-- Followers table
CREATE TABLE public.followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Anyone can see follows
CREATE POLICY "Follows are viewable by everyone"
  ON public.followers FOR SELECT USING (true);

-- Users can follow others
CREATE POLICY "Users can follow others"
  ON public.followers FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
  ON public.followers FOR DELETE USING (auth.uid() = follower_id);

-- Function to update follower counts
CREATE OR REPLACE FUNCTION public.update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE user_id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE user_id = OLD.following_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON public.followers
  FOR EACH ROW EXECUTE FUNCTION public.update_follower_count();