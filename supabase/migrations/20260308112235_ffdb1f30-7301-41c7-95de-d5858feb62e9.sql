-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  language TEXT,
  category TEXT,
  cover_url TEXT,
  file_url TEXT,
  file_format TEXT CHECK (file_format IN ('pdf', 'epub')),
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT true,
  preview_pages INTEGER NOT NULL DEFAULT 5,
  downloads_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Anyone can browse books
CREATE POLICY "Books are viewable by everyone"
  ON public.books FOR SELECT USING (true);

-- Creators can insert their own books
CREATE POLICY "Creators can insert their own books"
  ON public.books FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own books
CREATE POLICY "Creators can update their own books"
  ON public.books FOR UPDATE USING (auth.uid() = creator_id);

-- Creators can delete their own books
CREATE POLICY "Creators can delete their own books"
  ON public.books FOR DELETE USING (auth.uid() = creator_id);

-- Timestamp trigger
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage buckets for book covers and files
INSERT INTO storage.buckets (id, name, public) VALUES ('book-covers', 'book-covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('book-files', 'book-files', false);

-- Book covers: public read, authenticated upload
CREATE POLICY "Book covers are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'book-covers');

CREATE POLICY "Authenticated users can upload book covers"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'book-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own book covers"
  ON storage.objects FOR UPDATE USING (bucket_id = 'book-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own book covers"
  ON storage.objects FOR DELETE USING (bucket_id = 'book-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Book files: authenticated download, authenticated upload
CREATE POLICY "Authenticated users can download book files"
  ON storage.objects FOR SELECT USING (bucket_id = 'book-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload book files"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'book-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own book files"
  ON storage.objects FOR UPDATE USING (bucket_id = 'book-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own book files"
  ON storage.objects FOR DELETE USING (bucket_id = 'book-files' AND auth.uid()::text = (storage.foldername(name))[1]);