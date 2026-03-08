-- Gifts table
CREATE TABLE public.gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.mushaira_events(id) ON DELETE SET NULL,
  gift_type TEXT NOT NULL CHECK (gift_type IN ('rose', 'star', 'crown', 'diamond')),
  amount INTEGER NOT NULL DEFAULT 1,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (sender_id != recipient_id)
);

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gifts are viewable by everyone" ON public.gifts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send gifts" ON public.gifts FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Update profile gift count on new gift
CREATE OR REPLACE FUNCTION public.update_gift_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_gifts_received = total_gifts_received + NEW.amount
  WHERE user_id = NEW.recipient_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_gift_sent
  AFTER INSERT ON public.gifts
  FOR EACH ROW EXECUTE FUNCTION public.update_gift_count();

-- Index for fast lookups
CREATE INDEX idx_gifts_recipient ON public.gifts(recipient_id, created_at DESC);
CREATE INDEX idx_gifts_event ON public.gifts(event_id, created_at DESC);