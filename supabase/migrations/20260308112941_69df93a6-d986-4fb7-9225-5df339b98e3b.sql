-- Mushaira event types
CREATE TYPE public.mushaira_type AS ENUM ('open', 'curated', 'themed', 'international');
CREATE TYPE public.mushaira_status AS ENUM ('upcoming', 'live', 'ended', 'cancelled');

-- Mushaira events table
CREATE TABLE public.mushaira_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type mushaira_type NOT NULL DEFAULT 'open',
  status mushaira_status NOT NULL DEFAULT 'upcoming',
  language TEXT,
  theme TEXT,
  cover_url TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  max_performers INTEGER DEFAULT 20,
  audience_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mushaira_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone" ON public.mushaira_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON public.mushaira_events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update their events" ON public.mushaira_events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete their events" ON public.mushaira_events FOR DELETE USING (auth.uid() = organizer_id);

CREATE TRIGGER update_mushaira_events_updated_at
  BEFORE UPDATE ON public.mushaira_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Event registrations (poets signing up to perform)
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.mushaira_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'performer' CHECK (role IN ('performer', 'audience')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registrations are viewable by everyone" ON public.event_registrations FOR SELECT USING (true);
CREATE POLICY "Users can register for events" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel their registration" ON public.event_registrations FOR DELETE USING (auth.uid() = user_id);

-- Live chat messages for events
CREATE TABLE public.event_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.mushaira_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'chat' CHECK (message_type IN ('chat', 'reaction', 'applause')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event messages are viewable by everyone" ON public.event_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON public.event_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for fast message loading
CREATE INDEX idx_event_messages_event_id ON public.event_messages(event_id, created_at DESC);