-- Public review reads remain available only after approval. New reviews must
-- pass through the signed-in server route, where validation and moderation are
-- enforced. This removes the legacy direct-anonymous insert path.

DROP POLICY IF EXISTS "Anyone can submit review" ON public.reviews;

REVOKE INSERT, UPDATE, DELETE ON TABLE public.reviews FROM anon, authenticated;

COMMENT ON TABLE public.reviews IS
  'Student reviews are submitted through the authenticated server route and moderated before public display.';
