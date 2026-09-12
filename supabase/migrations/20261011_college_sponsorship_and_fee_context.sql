-- Keep editorial prominence, paid promotion, and fee meaning separate.
-- Existing featured colleges are intentionally NOT converted into sponsors.

ALTER TABLE public.colleges
  ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sponsor_label TEXT,
  ADD COLUMN IF NOT EXISTS sponsor_starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sponsor_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sponsor_position SMALLINT,
  ADD COLUMN IF NOT EXISTS sponsor_disclosure TEXT;

ALTER TABLE public.colleges DROP CONSTRAINT IF EXISTS colleges_sponsor_dates_valid;
ALTER TABLE public.colleges ADD CONSTRAINT colleges_sponsor_dates_valid
  CHECK (sponsor_starts_at IS NULL OR sponsor_ends_at IS NULL OR sponsor_ends_at > sponsor_starts_at);

ALTER TABLE public.colleges DROP CONSTRAINT IF EXISTS colleges_sponsor_position_valid;
ALTER TABLE public.colleges ADD CONSTRAINT colleges_sponsor_position_valid
  CHECK (sponsor_position IS NULL OR sponsor_position > 0);

CREATE INDEX IF NOT EXISTS idx_colleges_active_sponsorship
  ON public.colleges (is_sponsored, sponsor_position, sponsor_ends_at)
  WHERE is_sponsored = TRUE;

COMMENT ON COLUMN public.colleges.is_featured IS 'Editorial prominence. This must never be presented as paid placement.';
COMMENT ON COLUMN public.colleges.is_sponsored IS 'True only when a commercial placement has been approved and must be disclosed publicly.';
COMMENT ON COLUMN public.colleges.sponsor_disclosure IS 'Plain-language disclosure shown next to the paid placement.';

ALTER TABLE public.college_programs
  ADD COLUMN IF NOT EXISTS fee_period TEXT NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS fee_academic_year TEXT,
  ADD COLUMN IF NOT EXISTS fee_source_url TEXT,
  ADD COLUMN IF NOT EXISTS fee_last_verified_at TIMESTAMPTZ;

ALTER TABLE public.college_programs DROP CONSTRAINT IF EXISTS college_programs_fee_period_valid;
ALTER TABLE public.college_programs ADD CONSTRAINT college_programs_fee_period_valid
  CHECK (fee_period IN ('monthly', 'semester', 'annual', 'total_program', 'one_time', 'unknown'));

ALTER TABLE public.college_programs DROP CONSTRAINT IF EXISTS college_programs_fee_source_https;
ALTER TABLE public.college_programs ADD CONSTRAINT college_programs_fee_source_https
  CHECK (fee_source_url IS NULL OR fee_source_url ~ '^https://');

COMMENT ON COLUMN public.college_programs.fee_period IS 'Meaning of fee: monthly, semester, annual, total_program, one_time, or unknown. Unknown must be disclosed to students.';
COMMENT ON COLUMN public.college_programs.fee_academic_year IS 'Academic year or intake the quoted fee applies to, for example 2083/84.';
