
-- =========================================================
-- 1) PROFILES: protect CNIC (keep DOB visible for birthday feature)
-- =========================================================
REVOKE SELECT (cnic) ON public.profiles FROM anon, authenticated;
REVOKE INSERT (cnic), UPDATE (cnic) ON public.profiles FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.cnic_exists(_cnic text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE cnic = _cnic);
$$;
REVOKE EXECUTE ON FUNCTION public.cnic_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cnic_exists(text) TO anon, authenticated;

-- =========================================================
-- 2) BOOK-FILES storage: restrict to creator only (no purchases table yet)
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can download book files" ON storage.objects;
CREATE POLICY "Book creators can download their book files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'book-files'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- =========================================================
-- 3) AD_CLICKS / AD_IMPRESSIONS: hide ip_address from clients
-- =========================================================
REVOKE SELECT (ip_address) ON public.ad_clicks FROM anon, authenticated;
REVOKE SELECT (ip_address) ON public.ad_impressions FROM anon, authenticated;

-- =========================================================
-- 4) USER_BALANCES & ADVERTISER_BALANCES: prevent self-credit via trigger
-- =========================================================
CREATE OR REPLACE FUNCTION public.prevent_user_balance_inflation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- service_role bypasses RLS, but triggers still fire; allow service_role
  IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NEW.coins > OLD.coins THEN
    RAISE EXCEPTION 'Coin balance can only be increased through server-side functions';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.prevent_user_balance_inflation() FROM PUBLIC;

DROP TRIGGER IF EXISTS prevent_user_balance_inflation_trg ON public.user_balances;
CREATE TRIGGER prevent_user_balance_inflation_trg
BEFORE UPDATE ON public.user_balances
FOR EACH ROW EXECUTE FUNCTION public.prevent_user_balance_inflation();

CREATE OR REPLACE FUNCTION public.prevent_advertiser_balance_inflation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NEW.balance > OLD.balance
     OR NEW.total_deposited > OLD.total_deposited
     OR NEW.total_spent < OLD.total_spent THEN
    RAISE EXCEPTION 'Advertiser balance can only be increased through server-side functions';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.prevent_advertiser_balance_inflation() FROM PUBLIC;

DROP TRIGGER IF EXISTS prevent_advertiser_balance_inflation_trg ON public.advertiser_balances;
CREATE TRIGGER prevent_advertiser_balance_inflation_trg
BEFORE UPDATE ON public.advertiser_balances
FOR EACH ROW EXECUTE FUNCTION public.prevent_advertiser_balance_inflation();

-- =========================================================
-- 5) CREATOR_WALLETS: drop client UPDATE (trigger manages it)
-- =========================================================
DROP POLICY IF EXISTS "Users can update own wallet" ON public.creator_wallets;

-- =========================================================
-- 6) POST_IMPRESSIONS: restrict SELECT to owner or post creator
-- =========================================================
DROP POLICY IF EXISTS "Impressions viewable by everyone" ON public.post_impressions;
CREATE POLICY "Impressions viewable by owner or post creator"
ON public.post_impressions FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR auth.uid() = (SELECT creator_id FROM public.poetry_posts WHERE id = post_id)
);

-- =========================================================
-- 7) CONTACT_MESSAGES: allow admins to read
-- =========================================================
CREATE POLICY "Admins can read contact messages"
ON public.contact_messages FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 8) REFERRALS: only inviter sees rows (prevents invited from reading email)
-- =========================================================
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
CREATE POLICY "Inviters can view their referrals"
ON public.referrals FOR SELECT TO authenticated
USING (auth.uid() = inviter_id);

-- =========================================================
-- 9) STORAGE public bucket listing: drop broad SELECT, keep public URLs working
-- =========================================================
DROP POLICY IF EXISTS "Book covers are publicly accessible" ON storage.objects;
-- public buckets continue to serve files via signed/public CDN URLs without RLS SELECT

-- =========================================================
-- 10) Lock down trigger-only SECURITY DEFINER functions (revoke client EXECUTE)
-- =========================================================
DO $$
DECLARE fn text;
BEGIN
  FOR fn IN SELECT unnest(ARRAY[
    'update_wallet_on_gift()',
    'update_updated_at_column()',
    'update_fan_club_member_count()',
    'update_post_impressions_count()',
    'update_post_likes_count()',
    'update_post_comments_count()',
    'update_post_shares_count()',
    'update_story_reactions_count()',
    'update_story_views_count()',
    'update_gift_count()',
    'update_ad_click_count()',
    'update_ad_impression_count()',
    'update_following_count()',
    'update_follower_count()',
    'update_entry_votes_count()',
    'update_video_likes_count()',
    'auto_create_profile_settings()',
    'handle_new_user()',
    'check_referral_blue_badge()',
    'notify_on_like()',
    'notify_on_comment()',
    'notify_on_follow()',
    'notify_on_gift()',
    'notify_on_mushaira_live()',
    'notify_push_on_notification()',
    'settle_competitions()',
    'recalculate_engagement_score(uuid)'
  ])
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END $$;
