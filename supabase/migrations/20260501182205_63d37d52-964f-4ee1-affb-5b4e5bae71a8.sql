-- Books: currency + sale price
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS currency_code TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS currency_symbol TEXT NOT NULL DEFAULT '$',
  ADD COLUMN IF NOT EXISTS sale_price NUMERIC;

-- Universal content controls + soft delete on poetry_posts
ALTER TABLE public.poetry_posts
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS comment_permission TEXT NOT NULL DEFAULT 'everyone',
  ADD COLUMN IF NOT EXISTS notifications_off BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS comment_permission TEXT NOT NULL DEFAULT 'everyone',
  ADD COLUMN IF NOT EXISTS notifications_off BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Videos table may exist; guard with DO block
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='videos') THEN
    EXECUTE 'ALTER TABLE public.videos
      ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS comment_permission TEXT NOT NULL DEFAULT ''everyone'',
      ADD COLUMN IF NOT EXISTS notifications_off BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS display_date TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ';
  END IF;
END$$;

-- Indexes for trash queries
CREATE INDEX IF NOT EXISTS idx_poetry_posts_deleted ON public.poetry_posts(creator_id, is_deleted, deleted_at);
CREATE INDEX IF NOT EXISTS idx_books_deleted ON public.books(creator_id, is_deleted, deleted_at);

-- Validation: comment_permission must be one of allowed values
ALTER TABLE public.poetry_posts DROP CONSTRAINT IF EXISTS poetry_posts_comment_permission_chk;
ALTER TABLE public.poetry_posts ADD CONSTRAINT poetry_posts_comment_permission_chk
  CHECK (comment_permission IN ('everyone','followers','nobody'));

ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_comment_permission_chk;
ALTER TABLE public.books ADD CONSTRAINT books_comment_permission_chk
  CHECK (comment_permission IN ('everyone','followers','nobody'));