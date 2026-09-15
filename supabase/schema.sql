-- ============================================================
-- SikshyaNepal - Complete Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- UNIVERSITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_name TEXT NOT NULL,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed universities
INSERT INTO universities (name, slug, short_name, website) VALUES
  ('Tribhuvan University', 'tribhuvan-university', 'TU', 'https://tu.edu.np'),
  ('Kathmandu University', 'kathmandu-university', 'KU', 'https://ku.edu.np'),
  ('Pokhara University', 'pokhara-university', 'PU', 'https://pu.edu.np'),
  ('Purbanchal University', 'purbanchal-university', 'PurU', 'https://purbanchaluniversity.edu.np'),
  ('Rajarshi Janak University', 'rajarshi-janak-university', 'RJU', 'https://rju.edu.np'),
  ('Mid-Western University', 'mid-western-university', 'MWU', 'https://mwu.edu.np'),
  ('Far-Western University', 'far-western-university', 'FWU', 'https://fwu.edu.np')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PROGRAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  duration TEXT NOT NULL,
  degree_level TEXT NOT NULL CHECK (degree_level IN ('+2', 'bachelor', 'master', 'mphil', 'phd', 'diploma', 'certificate')),
  faculty TEXT NOT NULL,
  overview TEXT, eligibility TEXT, entrance_requirements TEXT,
  curriculum_highlights TEXT[] NOT NULL DEFAULT '{}', career_paths TEXT[] NOT NULL DEFAULT '{}',
  average_fee_min DECIMAL(12,2), average_fee_max DECIMAL(12,2), source_url TEXT,
  last_verified_at TIMESTAMPTZ, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed common programs
INSERT INTO programs (name, slug, duration, degree_level, faculty) VALUES
  ('Bachelor of Information Technology (BIT)', 'bit', '4 Years', 'bachelor', 'IT'),
  ('Bachelor of Science in Computer Science and Information Technology (B.Sc. CSIT)', 'bsc-csit', '4 Years', 'bachelor', 'IT'),
  ('Bachelor of Computer Application (BCA)', 'bca', '4 Years', 'bachelor', 'IT'),
  ('Bachelor of Engineering (BE) in Computer', 'be-computer', '4 Years', 'bachelor', 'Engineering'),
  ('Bachelor of Engineering (BE) in Civil', 'be-civil', '4 Years', 'bachelor', 'Engineering'),
  ('Bachelor of Engineering (BE) in Electronics', 'be-electronics', '4 Years', 'bachelor', 'Engineering'),
  ('Bachelor of Business Administration (BBA)', 'bba', '4 Years', 'bachelor', 'Management'),
  ('Bachelor of Business Management (BBM)', 'bbm', '4 Years', 'bachelor', 'Management'),
  ('Bachelor of Business Studies (BBS)', 'bbs', '4 Years', 'bachelor', 'Management'),
  ('Bachelor of Arts (BA)', 'ba', '4 Years', 'bachelor', 'Humanities'),
  ('Bachelor of Science (B.Sc.)', 'bsc', '4 Years', 'bachelor', 'Science'),
  ('Bachelor of Medicine, Bachelor of Surgery (MBBS)', 'mbbs', '5.5 Years', 'bachelor', 'Medical'),
  ('Bachelor of Pharmacy (B.Pharm)', 'bpharm', '4 Years', 'bachelor', 'Medical'),
  ('Bachelor of Nursing (B.Nurs)', 'bnursing', '4 Years', 'bachelor', 'Medical'),
  ('Bachelor of Education (B.Ed.)', 'bed', '4 Years', 'bachelor', 'Education'),
  ('Bachelor of Law (LLB)', 'llb', '3 Years', 'bachelor', 'Law'),
  ('Master of Business Administration (MBA)', 'mba', '2 Years', 'master', 'Management'),
  ('Master of Information Technology (MIT)', 'mit', '2 Years', 'master', 'IT'),
  ('Master of Science in Computer Science and Information Technology (M.Sc. CSIT)', 'msc-csit', '2 Years', 'master', 'IT'),
  ('Master of Arts (MA)', 'ma', '2 Years', 'master', 'Humanities'),
  ('Master of Education (M.Ed.)', 'med', '2 Years', 'master', 'Education'),
  ('Doctor of Philosophy (PhD)', 'phd', '3-5 Years', 'phd', 'Science'),
  ('Diploma in Computer Engineering', 'diploma-computer', '3 Years', 'diploma', 'Engineering'),
  ('Diploma in Civil Engineering', 'diploma-civil', '3 Years', 'diploma', 'Engineering'),
  ('Proficiency Certificate Level (PCL)', 'pcl', '2 Years', 'certificate', 'Science')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- COLLEGES
-- ============================================================
CREATE TABLE IF NOT EXISTS colleges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_url TEXT,
  affiliation TEXT,
  established_year INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  province TEXT,
  district TEXT,
  local_level TEXT,
  ward_number SMALLINT,
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  source_name TEXT,
  source_url TEXT,
  last_verified_at TIMESTAMPTZ,
  verified_by TEXT,
  education_levels TEXT[] NOT NULL DEFAULT '{}',
  facilities TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCHOOLS
-- ============================================================
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  iemis_code TEXT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  ownership_type TEXT CHECK (ownership_type IN ('community', 'institutional', 'religious', 'public', 'private', 'other')),
  school_level TEXT CHECK (school_level IN ('pre_primary', 'basic', 'secondary', 'multiple')),
  grades_from SMALLINT CHECK (grades_from BETWEEN 0 AND 10),
  grades_to SMALLINT CHECK (grades_to BETWEEN 0 AND 10),
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  local_level TEXT,
  ward_number SMALLINT CHECK (ward_number BETWEEN 1 AND 99),
  location TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_url TEXT,
  principal_name TEXT,
  medium_of_instruction TEXT[],
  streams TEXT[],
  facilities TEXT[],
  student_count INTEGER CHECK (student_count >= 0),
  teacher_count INTEGER CHECK (teacher_count >= 0),
  established_year INTEGER CHECK (established_year BETWEEN 1800 AND 2200),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_review', 'inactive')),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'source_verified', 'institution_verified')),
  source_name TEXT,
  source_url TEXT,
  source_published_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  verified_by TEXT,
  submitted_by TEXT,
  submitter_role TEXT,
  submitter_contact TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (grades_from IS NULL OR grades_to IS NULL OR grades_from <= grades_to)
);

CREATE TABLE IF NOT EXISTS data_corrections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('school', 'college')),
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  correction_type TEXT NOT NULL CHECK (correction_type IN ('incorrect_information', 'contact_update', 'program_update', 'closed_or_moved', 'claim_profile', 'other')),
  details TEXT NOT NULL CHECK (char_length(details) BETWEEN 10 AND 4000),
  source_url TEXT,
  reporter_name TEXT,
  reporter_email TEXT NOT NULL,
  reporter_role TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ADMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS admissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('school', 'college', 'university', 'training_provider', 'other')),
  institution_name TEXT NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  programs TEXT[] NOT NULL DEFAULT '{}',
  education_level TEXT,
  admission_type TEXT NOT NULL DEFAULT 'general' CHECK (admission_type IN ('general', 'entrance', 'scholarship', 'quota', 'transfer', 'other')),
  summary TEXT,
  details TEXT,
  eligibility TEXT,
  required_documents TEXT[] NOT NULL DEFAULT '{}',
  application_open_at TIMESTAMPTZ,
  application_deadline TIMESTAMPTZ,
  entrance_exam_at TIMESTAMPTZ,
  application_fee DECIMAL(12, 2) CHECK (application_fee >= 0),
  available_seats INTEGER CHECK (available_seats >= 0),
  application_url TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'source_verified' CHECK (verification_status IN ('unverified', 'source_verified', 'institution_verified')),
  last_verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_sponsored BOOLEAN NOT NULL DEFAULT FALSE,
  sponsor_label TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (school_id IS NULL OR college_id IS NULL),
  CHECK (NOT is_sponsored OR sponsor_label IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS admission_deadline_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admission_id UUID NOT NULL REFERENCES admissions(id) ON DELETE CASCADE,
  previous_deadline TIMESTAMPTZ,
  new_deadline TIMESTAMPTZ,
  reason TEXT,
  source_url TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COLLEGE PROGRAMS (Junction Table)
-- ============================================================
CREATE TABLE IF NOT EXISTS college_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  fee DECIMAL(12, 2),
  seats INTEGER,
  scholarship_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(college_id, program_id)
);

CREATE TABLE IF NOT EXISTS saved_colleges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, college_id)
);

CREATE TABLE IF NOT EXISTS saved_schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, school_id)
);

-- ============================================================
-- RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  program TEXT,
  semester TEXT,
  year INTEGER,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  result_url TEXT,
  published_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTICES
-- ============================================================
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  notice_url TEXT,
  published_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  image_url TEXT,
  author TEXT DEFAULT 'SikshyaNepal Editorial Team',
  tags TEXT[],
  published_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  author_name TEXT NOT NULL DEFAULT 'SikshyaNepal Editorial', source_name TEXT, source_url TEXT,
  last_verified_at TIMESTAMPTZ, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'published', content_category TEXT NOT NULL DEFAULT 'college_news',
  education_levels TEXT[] NOT NULL DEFAULT '{}', college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  automation_mode TEXT NOT NULL DEFAULT 'manual', disclosure TEXT
);

-- ============================================================
-- CONTENT INGESTION / EDITORIAL QUEUE
-- ============================================================
CREATE TABLE IF NOT EXISTS content_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL, source_type TEXT NOT NULL DEFAULT 'official',
  is_active BOOLEAN NOT NULL DEFAULT TRUE, requires_review BOOLEAN NOT NULL DEFAULT TRUE,
  last_checked_at TIMESTAMPTZ, last_success_at TIMESTAMPTZ, organization TEXT,
  trust_level SMALLINT NOT NULL DEFAULT 80 CHECK (trust_level BETWEEN 0 AND 100),
  permitted_targets TEXT[] NOT NULL DEFAULT ARRAY['news', 'notice', 'result'],
  fetch_frequency_minutes INTEGER, parsing_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  robots_reviewed_at TIMESTAMPTZ, terms_reviewed_at TIMESTAMPTZ,
  consecutive_failures INTEGER NOT NULL DEFAULT 0 CHECK (consecutive_failures >= 0),
  last_failure_at TIMESTAMPTZ, last_error TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS content_ingestion_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), source_id UUID REFERENCES content_sources(id) ON DELETE SET NULL,
  scraper_name TEXT NOT NULL, target_type TEXT NOT NULL, title TEXT NOT NULL, source_url TEXT NOT NULL,
  source_published_at TIMESTAMPTZ, payload JSONB NOT NULL, fingerprint TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', quality_flags TEXT[] NOT NULL DEFAULT '{}', reviewer_notes TEXT,
  reviewed_by TEXT, reviewed_at TIMESTAMPTZ, published_record_id UUID, content_hash TEXT, raw_snapshot TEXT,
  confidence_score SMALLINT NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'source_verified', 'editor_verified', 'rejected')),
  last_source_check_at TIMESTAMPTZ, content_category TEXT NOT NULL DEFAULT 'college_news',
  claim_risk TEXT NOT NULL DEFAULT 'medium', college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  auto_publish_eligible BOOLEAN NOT NULL DEFAULT FALSE, generation_version TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACCOUNTS, INSTITUTION CLAIMS & AUDIT
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user', status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS institution_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, entity_id UUID NOT NULL, institution_name TEXT NOT NULL, claimant_name TEXT NOT NULL,
  claimant_role TEXT NOT NULL, official_email TEXT NOT NULL, official_phone TEXT, evidence_url TEXT, evidence_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending', reviewed_by UUID REFERENCES auth.users(id), reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, entity_type, entity_id)
);
CREATE TABLE IF NOT EXISTS institution_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, entity_id UUID NOT NULL, role TEXT NOT NULL DEFAULT 'representative',
  granted_by UUID REFERENCES auth.users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(user_id, entity_type, entity_id)
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT, metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  student_name TEXT NOT NULL,
  program TEXT,
  year INTEGER,
  is_approved BOOLEAN DEFAULT FALSE,
  teaching_rating SMALLINT CHECK (teaching_rating BETWEEN 1 AND 5),
  facilities_rating SMALLINT CHECK (facilities_rating BETWEEN 1 AND 5),
  administration_rating SMALLINT CHECK (administration_rating BETWEEN 1 AND 5),
  value_rating SMALLINT CHECK (value_rating BETWEEN 1 AND 5),
  placement_rating SMALLINT CHECK (placement_rating BETWEEN 1 AND 5),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'submitted', 'verified', 'rejected')),
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), review_id UUID NOT NULL UNIQUE REFERENCES reviews(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE, responder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL CHECK (char_length(response_text) BETWEEN 20 AND 3000), status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id), reviewed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL UNIQUE REFERENCES reviews(id) ON DELETE CASCADE,
  evidence_url TEXT,
  evidence_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewer_notes TEXT
);

-- ============================================================
-- SCHOLARSHIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2),
  deadline TIMESTAMPTZ,
  eligibility TEXT,
  application_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SYLLABUS
-- ============================================================
CREATE TABLE IF NOT EXISTS syllabus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  semester TEXT,
  title TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- OLD QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS old_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  semester TEXT,
  year INTEGER,
  subject TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENTRANCE EXAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS entrance_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  program TEXT,
  exam_date TIMESTAMPTZ,
  application_deadline TIMESTAMPTZ,
  fee DECIMAL(10, 2),
  description TEXT,
  exam_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_colleges_slug ON colleges(slug);
CREATE INDEX IF NOT EXISTS idx_colleges_location ON colleges(location);
CREATE INDEX IF NOT EXISTS idx_colleges_is_featured ON colleges(is_featured);
CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_location ON schools(province, district, local_level);
CREATE INDEX IF NOT EXISTS idx_schools_type ON schools(ownership_type, school_level);
CREATE INDEX IF NOT EXISTS idx_schools_verified ON schools(verification_status, last_verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_schools_name_search ON schools USING gin(to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_data_corrections_status ON data_corrections(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admissions_deadline ON admissions(status, application_deadline);
CREATE INDEX IF NOT EXISTS idx_admission_deadline_history_admission ON admission_deadline_history(admission_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_admissions_institution ON admissions(institution_type, institution_name);
CREATE INDEX IF NOT EXISTS idx_admissions_school ON admissions(school_id) WHERE school_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admissions_college ON admissions(college_id) WHERE college_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admissions_search ON admissions USING gin(to_tsvector('simple', title || ' ' || institution_name));
CREATE INDEX IF NOT EXISTS idx_programs_slug ON programs(slug);
CREATE INDEX IF NOT EXISTS idx_programs_faculty ON programs(faculty);
CREATE INDEX IF NOT EXISTS idx_results_university ON results(university_id);
CREATE INDEX IF NOT EXISTS idx_results_published ON results(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_notices_university ON notices(university_id);
CREATE INDEX IF NOT EXISTS idx_notices_published ON notices(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_college ON reviews(college_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_verification_status ON reviews(verification_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scholarships_college ON scholarships(college_id);
CREATE INDEX IF NOT EXISTS idx_college_programs_college ON college_programs(college_id);
CREATE INDEX IF NOT EXISTS idx_college_programs_program ON college_programs(program_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_deadline_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE old_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrance_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_schools ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read colleges" ON colleges FOR SELECT TO anon USING (true);
CREATE POLICY "Public read admission deadline history" ON admission_deadline_history FOR SELECT TO anon USING (true);
CREATE POLICY "Public read published review responses" ON review_responses FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Public read active schools" ON schools FOR SELECT TO anon USING (status = 'active');
CREATE POLICY "Public read programs" ON programs FOR SELECT TO anon USING (true);
CREATE POLICY "Public read college_programs" ON college_programs FOR SELECT TO anon USING (true);
CREATE POLICY "Public read universities" ON universities FOR SELECT TO anon USING (true);
CREATE POLICY "Public read results" ON results FOR SELECT TO anon USING (true);
CREATE POLICY "Public read notices" ON notices FOR SELECT TO anon USING (true);
CREATE POLICY "Public read news" ON news FOR SELECT TO anon USING (true);
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT TO anon USING (is_approved = true);
CREATE POLICY "Public read scholarships" ON scholarships FOR SELECT TO anon USING (true);
CREATE POLICY "Public read syllabus" ON syllabus FOR SELECT TO anon USING (true);
CREATE POLICY "Public read old_questions" ON old_questions FOR SELECT TO anon USING (true);
CREATE POLICY "Public read entrance_exams" ON entrance_exams FOR SELECT TO anon USING (true);
CREATE POLICY "Users manage own saved schools" ON saved_schools FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Reviews are submitted only through the server-side /api/reviews route. That
-- route requires a signed-in user, records a private accountability link and
-- always places submissions into moderation before publication.
CREATE POLICY "Anyone can report corrections" ON data_corrections FOR INSERT TO anon WITH CHECK (status = 'pending');
CREATE POLICY "Public read published admissions" ON admissions FOR SELECT TO anon USING (status = 'published');
