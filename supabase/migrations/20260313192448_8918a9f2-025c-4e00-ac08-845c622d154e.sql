
-- Creator wallets for tracking earnings
CREATE TABLE public.creator_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  available_balance NUMERIC NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC NOT NULL DEFAULT 0,
  gift_earnings NUMERIC NOT NULL DEFAULT 0,
  book_earnings NUMERIC NOT NULL DEFAULT 0,
  fan_club_earnings NUMERIC NOT NULL DEFAULT 0,
  ad_earnings NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON public.creator_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet" ON public.creator_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.creator_wallets FOR UPDATE USING (auth.uid() = user_id);

-- Wallet transactions log
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'gift_received',
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Withdrawal requests
CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  payment_details JSONB,
  admin_notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals" ON public.withdrawal_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can request withdrawals" ON public.withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update withdrawals" ON public.withdrawal_requests FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all withdrawals" ON public.withdrawal_requests FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Trigger to update wallet when gifts are received (65% to creator)
CREATE OR REPLACE FUNCTION public.update_wallet_on_gift()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  creator_share NUMERIC;
BEGIN
  creator_share := NEW.coin_cost * 0.65;
  
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
$$;

CREATE TRIGGER on_gift_update_wallet
  AFTER INSERT ON public.gifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wallet_on_gift();
