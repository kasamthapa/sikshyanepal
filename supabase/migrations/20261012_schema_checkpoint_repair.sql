-- Idempotent repair for projects created before the entrance-exam and study-resource
-- publishing controls were introduced. Existing records remain private by default.

ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS exam_body TEXT;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS eligibility TEXT;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS syllabus_url TEXT;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS source_name TEXT;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE entrance_exams ADD CONSTRAINT entrance_exams_status_check
    CHECK (status IN ('draft', 'published', 'closed'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_entrance_exams_dates
  ON entrance_exams(status, application_deadline, exam_date);
ALTER TABLE entrance_exams ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public read published entrance exams" ON entrance_exams
    FOR SELECT TO anon, authenticated USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE syllabus ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE syllabus ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;
ALTER TABLE syllabus ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE old_questions ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE old_questions ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;
ALTER TABLE old_questions ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_syllabus_public
  ON syllabus(is_published, program_id, university_id);
CREATE INDEX IF NOT EXISTS idx_old_questions_public
  ON old_questions(is_published, program_id, university_id, year DESC);
ALTER TABLE syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE old_questions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public read verified syllabus" ON syllabus
    FOR SELECT TO anon, authenticated USING (is_published = TRUE);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Public read verified old questions" ON old_questions
    FOR SELECT TO anon, authenticated USING (is_published = TRUE);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN entrance_exams.status IS 'Only published records are visible to students.';
COMMENT ON COLUMN syllabus.is_published IS 'Publishing gate for source-checked syllabus records.';
COMMENT ON COLUMN old_questions.is_published IS 'Publishing gate for source-checked past-question records.';
