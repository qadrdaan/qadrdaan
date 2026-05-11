-- Ensure pg_net is enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_push_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fn_url text := 'https://boblfnrhuztfejixsqgc.supabase.co/functions/v1/send-push';
  url_path text := '/';
BEGIN
  IF NEW.reference_type = 'post' AND NEW.reference_id IS NOT NULL THEN
    url_path := '/post/' || NEW.reference_id::text;
  ELSIF NEW.reference_type = 'profile' AND NEW.reference_id IS NOT NULL THEN
    url_path := '/poet/' || NEW.reference_id::text;
  ELSIF NEW.reference_type = 'mushaira' AND NEW.reference_id IS NOT NULL THEN
    url_path := '/mushaira/' || NEW.reference_id::text;
  ELSIF NEW.reference_type = 'competition' AND NEW.reference_id IS NOT NULL THEN
    url_path := '/competitions/' || NEW.reference_id::text;
  END IF;

  PERFORM net.http_post(
    url := fn_url,
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'type', NEW.type,
      'title', NEW.title,
      'body', COALESCE(NEW.message, ''),
      'url', url_path,
      'tag', NEW.id::text
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_push_on_notification ON public.notifications;
CREATE TRIGGER trg_notify_push_on_notification
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.notify_push_on_notification();