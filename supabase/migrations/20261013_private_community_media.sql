-- Pending community media must not be publicly addressable before a moderator
-- approves its associated post. Files are stored privately and served through
-- short-lived signed links after the post-status check in the application.

ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS media_path TEXT;

UPDATE public.community_posts
SET media_path = regexp_replace(
  media_url,
  '^.*/storage/v1/object/public/community-media/',
  ''
)
WHERE media_path IS NULL
  AND media_url LIKE '%/storage/v1/object/public/community-media/%';

ALTER TABLE public.community_posts
  DROP CONSTRAINT IF EXISTS community_posts_content_check;

ALTER TABLE public.community_posts
  ADD CONSTRAINT community_posts_content_check
  CHECK (char_length(body) >= 30 OR media_path IS NOT NULL OR media_url IS NOT NULL);

UPDATE storage.buckets
SET public = FALSE
WHERE id = 'community-media';

COMMENT ON COLUMN public.community_posts.media_path IS
  'Private community-media storage key. Only the server creates signed links after authorization and post-status checks.';
