
-- ===========================================
-- 1. NOTIFICATIONS TABLE
-- ===========================================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  message text,
  reference_id uuid,
  reference_type text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- ===========================================
-- 2. DATABASE INDEXES for performance
-- ===========================================
-- Posts
CREATE INDEX IF NOT EXISTS idx_poetry_posts_creator ON public.poetry_posts(creator_id);
CREATE INDEX IF NOT EXISTS idx_poetry_posts_engagement ON public.poetry_posts(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_poetry_posts_created ON public.poetry_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poetry_posts_category ON public.poetry_posts(category);
CREATE INDEX IF NOT EXISTS idx_poetry_posts_language ON public.poetry_posts(language);
CREATE INDEX IF NOT EXISTS idx_poetry_posts_impressions ON public.poetry_posts(impressions_count);

-- Likes, comments, shares
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_post ON public.post_shares(post_id);

-- Followers
CREATE INDEX IF NOT EXISTS idx_followers_follower ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON public.followers(following_id);

-- Ads
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_advertiser ON public.ad_campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_campaign ON public.ad_impressions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_created ON public.ad_impressions(created_at);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_campaign ON public.ad_clicks(campaign_id);

-- Gifts
CREATE INDEX IF NOT EXISTS idx_gifts_recipient ON public.gifts(recipient_id);
CREATE INDEX IF NOT EXISTS idx_gifts_sender ON public.gifts(sender_id);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_followers ON public.profiles(followers_count DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);

-- Bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);

-- Videos
CREATE INDEX IF NOT EXISTS idx_videos_creator ON public.videos(creator_id);
CREATE INDEX IF NOT EXISTS idx_videos_views ON public.videos(views_count DESC);

-- Books
CREATE INDEX IF NOT EXISTS idx_books_creator ON public.books(creator_id);
CREATE INDEX IF NOT EXISTS idx_books_downloads ON public.books(downloads_count DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- Watch time
CREATE INDEX IF NOT EXISTS idx_watch_time_creator ON public.watch_time_tracking(creator_id);
CREATE INDEX IF NOT EXISTS idx_watch_time_viewer ON public.watch_time_tracking(viewer_id);

-- Wallet
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_wallets_user ON public.creator_wallets(user_id);

-- ===========================================
-- 3. UNIQUE CONSTRAINTS to prevent duplicates
-- ===========================================
-- Prevent duplicate likes
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_post_like ON public.post_likes(post_id, user_id);

-- Prevent duplicate follows
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_follow ON public.followers(follower_id, following_id);

-- Prevent duplicate bookmarks
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_bookmark ON public.bookmarks(user_id, content_type, content_id);

-- Prevent duplicate video likes
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_video_like ON public.video_likes(video_id, user_id);

-- Prevent duplicate competition votes
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_comp_vote ON public.competition_votes(entry_id, user_id);

-- One CNIC per profile
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_cnic ON public.profiles(cnic) WHERE cnic IS NOT NULL;

-- ===========================================
-- 4. NOTIFICATION TRIGGERS
-- ===========================================

-- Notify on like
CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE
  post_creator uuid;
  liker_name text;
BEGIN
  SELECT creator_id INTO post_creator FROM public.poetry_posts WHERE id = NEW.post_id;
  IF post_creator IS NULL OR post_creator = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, 'Someone') INTO liker_name FROM public.profiles WHERE user_id = NEW.user_id;
  INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_type)
  VALUES (post_creator, 'like', 'New Like', liker_name || ' liked your post', NEW.post_id, 'post');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_like AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

-- Notify on comment
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE
  post_creator uuid;
  commenter_name text;
BEGIN
  SELECT creator_id INTO post_creator FROM public.poetry_posts WHERE id = NEW.post_id;
  IF post_creator IS NULL OR post_creator = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, 'Someone') INTO commenter_name FROM public.profiles WHERE user_id = NEW.user_id;
  INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_type)
  VALUES (post_creator, 'comment', 'New Comment', commenter_name || ' commented on your post', NEW.post_id, 'post');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_comment AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- Notify on follow
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE
  follower_name text;
BEGIN
  SELECT COALESCE(display_name, 'Someone') INTO follower_name FROM public.profiles WHERE user_id = NEW.follower_id;
  INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_type)
  VALUES (NEW.following_id, 'follow', 'New Follower', follower_name || ' started following you', NEW.follower_id, 'profile');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_follow AFTER INSERT ON public.followers
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();

-- Notify on gift
CREATE OR REPLACE FUNCTION public.notify_on_gift()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE
  sender_name text;
BEGIN
  IF NEW.recipient_id = NEW.sender_id THEN RETURN NEW; END IF;
  SELECT COALESCE(display_name, 'Someone') INTO sender_name FROM public.profiles WHERE user_id = NEW.sender_id;
  INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_type)
  VALUES (NEW.recipient_id, 'gift', 'Gift Received!', sender_name || ' sent you a ' || NEW.gift_type, NEW.id, 'gift');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_gift AFTER INSERT ON public.gifts
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_gift();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
