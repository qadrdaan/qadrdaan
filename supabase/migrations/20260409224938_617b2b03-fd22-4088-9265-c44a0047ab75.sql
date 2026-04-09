CREATE OR REPLACE FUNCTION public.update_wallet_on_gift()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  creator_share NUMERIC;
BEGIN
  -- Creator receives 60%, platform retains 40%
  creator_share := NEW.coin_cost * 0.60;
  
  INSERT INTO public.creator_wallets (user_id, total_earnings, available_balance, gift_earnings)
  VALUES (NEW.recipient_id, creator_share, creator_share, creator_share)
  ON CONFLICT (user_id) DO UPDATE SET
    total_earnings = creator_wallets.total_earnings + creator_share,
    available_balance = creator_wallets.available_balance + creator_share,
    gift_earnings = creator_wallets.gift_earnings + creator_share,
    updated_at = now();

  INSERT INTO public.wallet_transactions (user_id, amount, transaction_type, description, reference_id)
  VALUES (NEW.recipient_id, creator_share, 'gift_received', 'Gift: ' || NEW.gift_type, NEW.id);

  RETURN NEW;
END;
$function$;