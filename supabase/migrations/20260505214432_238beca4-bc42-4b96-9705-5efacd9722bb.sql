
CREATE OR REPLACE FUNCTION public.notify_on_mushaira_live()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  organizer_name text;
BEGIN
  IF NEW.status = 'live' AND (OLD.status IS DISTINCT FROM 'live') THEN
    SELECT COALESCE(display_name, 'A poet') INTO organizer_name FROM public.profiles WHERE user_id = NEW.organizer_id;
    INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_type)
    SELECT f.follower_id, 'mushaira_live', '🔴 Mushaira is live',
           organizer_name || ' just started "' || NEW.title || '"',
           NEW.id, 'mushaira'
    FROM public.followers f
    WHERE f.following_id = NEW.organizer_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_mushaira_live ON public.mushaira_events;
CREATE TRIGGER trg_notify_mushaira_live
AFTER UPDATE ON public.mushaira_events
FOR EACH ROW EXECUTE FUNCTION public.notify_on_mushaira_live();
