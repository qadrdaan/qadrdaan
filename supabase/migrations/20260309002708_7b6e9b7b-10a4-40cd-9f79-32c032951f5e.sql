-- Create user_balances table to track gift coins
CREATE TABLE IF NOT EXISTS public.user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  coins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT user_balances_user_id_unique UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

-- Users can view their own balance
CREATE POLICY "Users can view own balance" ON public.user_balances
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own balance (for purchases)
CREATE POLICY "Users can update own balance" ON public.user_balances
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own balance
CREATE POLICY "Users can insert own balance" ON public.user_balances
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create coin_purchases table to track all coin purchases
CREATE TABLE IF NOT EXISTS public.coin_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'stripe',
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on coin_purchases
ALTER TABLE public.coin_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchase history
CREATE POLICY "Users can view own purchases" ON public.coin_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own purchases
CREATE POLICY "Users can insert own purchases" ON public.coin_purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at on user_balances
CREATE TRIGGER update_user_balances_updated_at
  BEFORE UPDATE ON public.user_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update gifts table to track coin cost
ALTER TABLE public.gifts
ADD COLUMN IF NOT EXISTS coin_cost INTEGER NOT NULL DEFAULT 1;