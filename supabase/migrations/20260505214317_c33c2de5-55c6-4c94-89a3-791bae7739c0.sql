
-- Web-push subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subs - select" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own push subs - insert" ON public.push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own push subs - delete" ON public.push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Settle competitions whose voting deadline has passed
CREATE OR REPLACE FUNCTION public.settle_competitions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  comp RECORD;
  winner RECORD;
BEGIN
  FOR comp IN
    SELECT id FROM public.competitions
    WHERE status <> 'ended' AND voting_deadline <= now()
  LOOP
    SELECT e.id, e.user_id, e.title,
           (e.votes_count + COALESCE((
             SELECT SUM(g.amount) FROM public.gifts g WHERE g.recipient_id = e.user_id
             AND g.created_at >= (SELECT created_at FROM public.competitions WHERE id = comp.id)
           ), 0)) AS score
      INTO winner
      FROM public.competition_entries e
      WHERE e.competition_id = comp.id
      ORDER BY score DESC NULLS LAST, e.votes_count DESC
      LIMIT 1;

    UPDATE public.competitions SET status = 'ended', updated_at = now() WHERE id = comp.id;

    IF winner.id IS NOT NULL THEN
      INSERT INTO public.competition_awards (entry_id, competition_id, user_id, award_type)
      VALUES (winner.id, comp.id, winner.user_id, 'gold')
      ON CONFLICT DO NOTHING;

      UPDATE public.competition_entries SET rank = 1 WHERE id = winner.id;

      INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_type)
      VALUES (winner.user_id, 'competition_win', 'You won! 🏆',
              'Your entry "' || winner.title || '" won the competition.',
              comp.id, 'competition');
    END IF;
  END LOOP;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
