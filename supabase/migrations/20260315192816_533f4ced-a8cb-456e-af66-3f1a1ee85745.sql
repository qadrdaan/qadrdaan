
-- Advertiser balances (prepaid ad wallet)
CREATE TABLE public.advertiser_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance numeric NOT NULL DEFAULT 0,
  total_deposited numeric NOT NULL DEFAULT 0,
  total_spent numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.advertiser_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ad balance" ON public.advertiser_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ad balance" ON public.advertiser_balances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ad balance" ON public.advertiser_balances FOR UPDATE USING (auth.uid() = user_id);

-- Ad campaigns
CREATE TYPE public.ad_pricing_model AS ENUM ('cpc', 'cpm', 'cpa');
CREATE TYPE public.ad_status AS ENUM ('draft', 'pending_review', 'active', 'paused', 'completed', 'rejected');
CREATE TYPE public.ad_type AS ENUM ('sponsored_post', 'single_image', 'carousel', 'video', 'search', 'profile_promotion', 'event_promotion');
CREATE TYPE public.ad_placement AS ENUM ('feed', 'story', 'video_between', 'search_results', 'profile', 'marketplace', 'live_room');

CREATE TABLE public.ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id uuid NOT NULL,
  name text NOT NULL,
  ad_type public.ad_type NOT NULL DEFAULT 'sponsored_post',
  pricing_model public.ad_pricing_model NOT NULL DEFAULT 'cpc',
  status public.ad_status NOT NULL DEFAULT 'draft',
  placements public.ad_placement[] NOT NULL DEFAULT '{feed}',
  target_locations text[] DEFAULT '{}',
  target_languages text[] DEFAULT '{}',
  target_interests text[] DEFAULT '{}',
  target_categories text[] DEFAULT '{}',
  target_follower_of uuid[] DEFAULT '{}',
  daily_budget numeric NOT NULL DEFAULT 5,
  lifetime_budget numeric,
  bid_amount numeric NOT NULL DEFAULT 0.10,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  impressions_count integer NOT NULL DEFAULT 0,
  clicks_count integer NOT NULL DEFAULT 0,
  conversions_count integer NOT NULL DEFAULT 0,
  total_spent numeric NOT NULL DEFAULT 0,
  quality_score numeric NOT NULL DEFAULT 5.0,
  engagement_rate numeric NOT NULL DEFAULT 0,
  review_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Advertisers can view own campaigns" ON public.ad_campaigns FOR SELECT USING (auth.uid() = advertiser_id);
CREATE POLICY "Advertisers can create campaigns" ON public.ad_campaigns FOR INSERT WITH CHECK (auth.uid() = advertiser_id);
CREATE POLICY "Advertisers can update own campaigns" ON public.ad_campaigns FOR UPDATE USING (auth.uid() = advertiser_id);
CREATE POLICY "Advertisers can delete draft campaigns" ON public.ad_campaigns FOR DELETE USING (auth.uid() = advertiser_id AND status = 'draft');
CREATE POLICY "Admins can view all ad campaigns" ON public.ad_campaigns FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update ad campaigns" ON public.ad_campaigns FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Ad creatives
CREATE TABLE public.ad_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  headline text,
  body_text text,
  image_url text,
  video_url text,
  cta_text text DEFAULT 'Learn More',
  cta_link text,
  carousel_slides jsonb,
  promoted_post_id uuid,
  promoted_profile_id uuid,
  promoted_event_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can select creatives" ON public.ad_creatives FOR SELECT USING (
  campaign_id IN (SELECT id FROM public.ad_campaigns WHERE advertiser_id = auth.uid())
);
CREATE POLICY "Owners can insert creatives" ON public.ad_creatives FOR INSERT WITH CHECK (
  campaign_id IN (SELECT id FROM public.ad_campaigns WHERE advertiser_id = auth.uid())
);
CREATE POLICY "Owners can update creatives" ON public.ad_creatives FOR UPDATE USING (
  campaign_id IN (SELECT id FROM public.ad_campaigns WHERE advertiser_id = auth.uid())
);
CREATE POLICY "Owners can delete creatives" ON public.ad_creatives FOR DELETE USING (
  campaign_id IN (SELECT id FROM public.ad_campaigns WHERE advertiser_id = auth.uid())
);
CREATE POLICY "Admins can view all creatives" ON public.ad_creatives FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Ad impressions
CREATE TABLE public.ad_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  creative_id uuid REFERENCES public.ad_creatives(id) ON DELETE SET NULL,
  user_id uuid,
  placement public.ad_placement NOT NULL DEFAULT 'feed',
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert ad impressions" ON public.ad_impressions FOR INSERT WITH CHECK (true);
CREATE POLICY "Advertisers can view own impressions" ON public.ad_impressions FOR SELECT USING (
  campaign_id IN (SELECT id FROM public.ad_campaigns WHERE advertiser_id = auth.uid())
);
CREATE POLICY "Admins can view all ad impressions" ON public.ad_impressions FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Ad clicks
CREATE TABLE public.ad_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  creative_id uuid REFERENCES public.ad_creatives(id) ON DELETE SET NULL,
  user_id uuid,
  ip_address text,
  is_fraud boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert ad clicks" ON public.ad_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Advertisers can view own clicks" ON public.ad_clicks FOR SELECT USING (
  campaign_id IN (SELECT id FROM public.ad_campaigns WHERE advertiser_id = auth.uid())
);
CREATE POLICY "Admins can view all ad clicks" ON public.ad_clicks FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Ad conversions
CREATE TABLE public.ad_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  user_id uuid,
  action_type text NOT NULL DEFAULT 'click',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert ad conversions" ON public.ad_conversions FOR INSERT WITH CHECK (true);
CREATE POLICY "Advertisers can view own conversions" ON public.ad_conversions FOR SELECT USING (
  campaign_id IN (SELECT id FROM public.ad_campaigns WHERE advertiser_id = auth.uid())
);

-- Ad deposit transactions
CREATE TABLE public.ad_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  transaction_type text NOT NULL DEFAULT 'deposit',
  description text,
  campaign_id uuid REFERENCES public.ad_campaigns(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ad transactions" ON public.ad_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ad transactions" ON public.ad_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all ad transactions" ON public.ad_transactions FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_ad_campaigns_advertiser ON public.ad_campaigns(advertiser_id);
CREATE INDEX idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX idx_ad_impressions_campaign ON public.ad_impressions(campaign_id);
CREATE INDEX idx_ad_impressions_created ON public.ad_impressions(created_at);
CREATE INDEX idx_ad_clicks_campaign ON public.ad_clicks(campaign_id);
CREATE INDEX idx_ad_creatives_campaign ON public.ad_creatives(campaign_id);

-- Trigger: update impression count + CPM billing
CREATE OR REPLACE FUNCTION public.update_ad_impression_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.ad_campaigns SET impressions_count = impressions_count + 1 WHERE id = NEW.campaign_id;
  IF (SELECT pricing_model FROM public.ad_campaigns WHERE id = NEW.campaign_id) = 'cpm' THEN
    UPDATE public.ad_campaigns SET total_spent = total_spent + (bid_amount / 1000.0) WHERE id = NEW.campaign_id;
    UPDATE public.advertiser_balances SET balance = balance - (
      SELECT bid_amount / 1000.0 FROM public.ad_campaigns WHERE id = NEW.campaign_id
    ), total_spent = total_spent + (
      SELECT bid_amount / 1000.0 FROM public.ad_campaigns WHERE id = NEW.campaign_id
    ) WHERE user_id = (SELECT advertiser_id FROM public.ad_campaigns WHERE id = NEW.campaign_id);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_ad_impression AFTER INSERT ON public.ad_impressions FOR EACH ROW EXECUTE FUNCTION public.update_ad_impression_count();

-- Trigger: update click count + CPC billing
CREATE OR REPLACE FUNCTION public.update_ad_click_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.ad_campaigns SET clicks_count = clicks_count + 1 WHERE id = NEW.campaign_id;
  IF (SELECT pricing_model FROM public.ad_campaigns WHERE id = NEW.campaign_id) = 'cpc' AND NEW.is_fraud = false THEN
    UPDATE public.ad_campaigns SET total_spent = total_spent + (SELECT bid_amount FROM public.ad_campaigns WHERE id = NEW.campaign_id) WHERE id = NEW.campaign_id;
    UPDATE public.advertiser_balances SET balance = balance - (
      SELECT bid_amount FROM public.ad_campaigns WHERE id = NEW.campaign_id
    ), total_spent = total_spent + (
      SELECT bid_amount FROM public.ad_campaigns WHERE id = NEW.campaign_id
    ) WHERE user_id = (SELECT advertiser_id FROM public.ad_campaigns WHERE id = NEW.campaign_id);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_ad_click AFTER INSERT ON public.ad_clicks FOR EACH ROW EXECUTE FUNCTION public.update_ad_click_count();
