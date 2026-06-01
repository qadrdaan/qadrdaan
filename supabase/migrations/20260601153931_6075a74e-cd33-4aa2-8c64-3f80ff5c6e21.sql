
-- Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cnic_exists(text) FROM authenticated;
-- cnic_exists must remain callable by anon (signup happens pre-auth), but revoke from authenticated
REVOKE EXECUTE ON FUNCTION public.prevent_user_balance_inflation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_advertiser_balance_inflation() FROM PUBLIC, anon, authenticated;

-- Drop broad SELECT policies on public buckets to prevent listing.
-- Files remain accessible via direct public CDN URLs since the buckets are marked public.
DROP POLICY IF EXISTS "Cover images are public" ON storage.objects;
DROP POLICY IF EXISTS "Thumbnails are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Videos are publicly accessible" ON storage.objects;
