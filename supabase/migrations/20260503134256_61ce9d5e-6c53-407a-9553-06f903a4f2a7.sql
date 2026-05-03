-- 1. Enforce CNIC uniqueness at DB level (one account per CNIC)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_cnic_unique
  ON public.profiles (cnic)
  WHERE cnic IS NOT NULL;

-- 2. Auto-grant Blue Badge at 100 accepted referrals
CREATE OR REPLACE FUNCTION public.check_referral_blue_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  accepted_count integer;
BEGIN
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status <> 'accepted') THEN
    SELECT COUNT(*) INTO accepted_count
    FROM public.referrals
    WHERE inviter_id = NEW.inviter_id AND status = 'accepted';

    IF accepted_count >= 100 THEN
      UPDATE public.profiles
      SET is_verified = true
      WHERE user_id = NEW.inviter_id AND is_verified = false;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_referral_blue_badge ON public.referrals;
CREATE TRIGGER trg_referral_blue_badge
AFTER INSERT OR UPDATE OF status ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public.check_referral_blue_badge();