
-- Allow admins to SELECT all coin_purchases
CREATE POLICY "Admins can view all purchases"
ON public.coin_purchases
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
