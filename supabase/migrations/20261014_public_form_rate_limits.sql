-- Minimal, private abuse control for unauthenticated public forms.
-- This stores only a salted request fingerprint and expires it after seven days.

CREATE TABLE IF NOT EXISTS public_form_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL CHECK (action IN ('subscribe', 'correction', 'college_submission', 'school_submission')),
  fingerprint_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_public_form_attempts_rate
  ON public_form_attempts (action, fingerprint_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_form_attempts_expiry
  ON public_form_attempts (expires_at);

ALTER TABLE public_form_attempts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION consume_public_form_rate_limit(
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
  IF p_limit < 1 OR p_action NOT IN ('subscribe', 'correction', 'college_submission', 'school_submission') THEN
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

REVOKE ALL ON TABLE public_form_attempts FROM anon, authenticated;
REVOKE ALL ON FUNCTION consume_public_form_rate_limit(TEXT, TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION consume_public_form_rate_limit(TEXT, TEXT, INTEGER) TO service_role;

COMMENT ON TABLE public_form_attempts IS 'Private, short-lived salted fingerprints used only to throttle unauthenticated public forms.';
