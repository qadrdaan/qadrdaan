
-- Competition status enum
CREATE TYPE public.competition_status AS ENUM ('upcoming', 'active', 'voting', 'ended');

-- Competitions table
CREATE TABLE public.competitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT,
  language TEXT,
  status competition_status NOT NULL DEFAULT 'upcoming',
  max_entries INTEGER DEFAULT 50,
  entry_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  voting_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Competition entries
CREATE TABLE public.competition_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  votes_count INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(competition_id, user_id)
);

-- Competition votes
CREATE TABLE public.competition_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES public.competition_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(entry_id, user_id)
);

-- Competition awards
CREATE TABLE public.competition_awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES public.competition_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  award_type TEXT NOT NULL DEFAULT 'gold',
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_awards ENABLE ROW LEVEL SECURITY;

-- Competitions policies
CREATE POLICY "Competitions viewable by everyone" ON public.competitions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create competitions" ON public.competitions FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update their competitions" ON public.competitions FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete their competitions" ON public.competitions FOR DELETE USING (auth.uid() = organizer_id);

-- Entries policies
CREATE POLICY "Entries viewable by everyone" ON public.competition_entries FOR SELECT USING (true);
CREATE POLICY "Authenticated users can submit entries" ON public.competition_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their entries" ON public.competition_entries FOR DELETE USING (auth.uid() = user_id);

-- Votes policies
CREATE POLICY "Votes viewable by everyone" ON public.competition_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.competition_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their vote" ON public.competition_votes FOR DELETE USING (auth.uid() = user_id);

-- Awards policies
CREATE POLICY "Awards viewable by everyone" ON public.competition_awards FOR SELECT USING (true);
CREATE POLICY "Organizers can give awards" ON public.competition_awards FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT organizer_id FROM public.competitions WHERE id = competition_id)
);

-- Trigger for vote count
CREATE OR REPLACE FUNCTION public.update_entry_votes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.competition_entries SET votes_count = votes_count + 1 WHERE id = NEW.entry_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.competition_entries SET votes_count = GREATEST(votes_count - 1, 0) WHERE id = OLD.entry_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_vote_change
AFTER INSERT OR DELETE ON public.competition_votes
FOR EACH ROW EXECUTE FUNCTION public.update_entry_votes_count();

-- Updated_at trigger
CREATE TRIGGER update_competitions_updated_at
BEFORE UPDATE ON public.competitions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
