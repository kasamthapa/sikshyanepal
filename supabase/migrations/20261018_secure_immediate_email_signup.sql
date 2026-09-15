-- Email/password sign-up is intentionally immediate in the app. This extends
-- the private public-form limiter so the server-side confirmed-user endpoint
-- cannot be used for unrestricted account creation.

ALTER TABLE public.public_form_attempts
  DROP CONSTRAINT IF EXISTS public_form_attempts_action_check;

ALTER TABLE public.public_form_attempts
  ADD CONSTRAINT public_form_attempts_action_check
  CHECK (action IN ('subscribe', 'correction', 'college_submission', 'school_submission', 'account_registration'));

CREATE OR REPLACE FUNCTION public.consume_public_form_rate_limit(
  p_action TEXT,
  p_fingerprint_hash TEXT,
  p_limit INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE attempt_count INTEGER;
BEGIN
  IF p_limit < 1 OR p_action NOT IN ('subscribe', 'correction', 'college_submission', 'school_submission', 'account_registration') THEN
    RAISE EXCEPTION 'Invalid rate limit action';
  END IF;

  DELETE FROM public_form_attempts WHERE expires_at < NOW();
  INSERT INTO public_form_attempts (action, fingerprint_hash) VALUES (p_action, p_fingerprint_hash);
  SELECT COUNT(*) INTO attempt_count
  FROM public_form_attempts
  WHERE action = p_action
    AND fingerprint_hash = p_fingerprint_hash
    AND created_at >= NOW() - INTERVAL '1 hour';

  RETURN attempt_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_public_form_rate_limit(TEXT, TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_public_form_rate_limit(TEXT, TEXT, INTEGER) TO service_role;
