
-- Fan Clubs
CREATE TABLE public.fan_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC NOT NULL DEFAULT 3.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fan_clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fan clubs viewable by everyone" ON public.fan_clubs FOR SELECT USING (true);
CREATE POLICY "Creators can create own fan club" ON public.fan_clubs FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own fan club" ON public.fan_clubs FOR UPDATE USING (auth.uid() = creator_id);

-- Fan Club Subscriptions
CREATE TABLE public.fan_club_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_club_id UUID NOT NULL REFERENCES public.fan_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  UNIQUE(fan_club_id, user_id)
);

ALTER TABLE public.fan_club_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON public.fan_club_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can subscribe" ON public.fan_club_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel subscription" ON public.fan_club_subscriptions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Creators can view club members" ON public.fan_club_subscriptions FOR SELECT USING (
  fan_club_id IN (SELECT id FROM public.fan_clubs WHERE creator_id = auth.uid())
);

-- Fan Club Posts (exclusive content)
CREATE TABLE public.fan_club_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_club_id UUID NOT NULL REFERENCES public.fan_clubs(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fan_club_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Club members can view posts" ON public.fan_club_posts FOR SELECT USING (
  creator_id = auth.uid() OR
  fan_club_id IN (SELECT fan_club_id FROM public.fan_club_subscriptions WHERE user_id = auth.uid() AND status = 'active')
);
CREATE POLICY "Creators can create posts" ON public.fan_club_posts FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can delete posts" ON public.fan_club_posts FOR DELETE USING (auth.uid() = creator_id);

-- Update member count trigger
CREATE OR REPLACE FUNCTION public.update_fan_club_member_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.fan_clubs SET member_count = member_count + 1 WHERE id = NEW.fan_club_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.fan_clubs SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.fan_club_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_fan_club_sub_change
  AFTER INSERT OR DELETE ON public.fan_club_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fan_club_member_count();

-- Video Mushaira Rooms
CREATE TABLE public.video_mushaira_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  max_seats INTEGER NOT NULL DEFAULT 30,
  competition_mode BOOLEAN NOT NULL DEFAULT false,
  audience_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

ALTER TABLE public.video_mushaira_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rooms viewable by everyone" ON public.video_mushaira_rooms FOR SELECT USING (true);
CREATE POLICY "Auth users can create rooms" ON public.video_mushaira_rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update rooms" ON public.video_mushaira_rooms FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete rooms" ON public.video_mushaira_rooms FOR DELETE USING (auth.uid() = host_id);

-- Room Seats
CREATE TABLE public.room_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.video_mushaira_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  seat_number INTEGER NOT NULL,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  score INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, seat_number),
  UNIQUE(room_id, user_id)
);

ALTER TABLE public.room_seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seats viewable by everyone" ON public.room_seats FOR SELECT USING (true);
CREATE POLICY "Users can take seats" ON public.room_seats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Hosts can manage seats" ON public.room_seats FOR UPDATE USING (
  room_id IN (SELECT id FROM public.video_mushaira_rooms WHERE host_id = auth.uid())
);
CREATE POLICY "Users or hosts can remove seats" ON public.room_seats FOR DELETE USING (
  auth.uid() = user_id OR
  room_id IN (SELECT id FROM public.video_mushaira_rooms WHERE host_id = auth.uid())
);

-- Room Queue
CREATE TABLE public.room_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.video_mushaira_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE public.room_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Queue viewable by everyone" ON public.room_queue FOR SELECT USING (true);
CREATE POLICY "Users can join queue" ON public.room_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users or hosts can remove from queue" ON public.room_queue FOR DELETE USING (
  auth.uid() = user_id OR
  room_id IN (SELECT id FROM public.video_mushaira_rooms WHERE host_id = auth.uid())
);

-- Enable realtime for rooms
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_seats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_mushaira_rooms;
