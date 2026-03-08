
-- Create cover-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('cover-images', 'cover-images', true);

-- Allow authenticated users to upload their own cover images
CREATE POLICY "Users can upload cover images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cover-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read of cover images
CREATE POLICY "Cover images are public" ON storage.objects FOR SELECT USING (bucket_id = 'cover-images');

-- Allow users to update/delete their own cover images
CREATE POLICY "Users can update own cover images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'cover-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own cover images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cover-images' AND (storage.foldername(name))[1] = auth.uid()::text);
