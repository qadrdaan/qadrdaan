
-- Add CNIC and date_of_birth columns to profiles
ALTER TABLE public.profiles ADD COLUMN cnic text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN date_of_birth date;

-- Add promotion_spent_required column to track if user has fulfilled 40% promotion obligation
ALTER TABLE public.profiles ADD COLUMN promotion_obligation_met boolean NOT NULL DEFAULT false;

-- Add promotion_coins_spent column to track how much user has spent on promotions
ALTER TABLE public.profiles ADD COLUMN promotion_coins_spent integer NOT NULL DEFAULT 0;
