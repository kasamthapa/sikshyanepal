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
  degree_level TEXT NOT NULL CHECK (degree_level IN ('bachelor', 'master', 'mphil', 'phd', 'diploma', 'certificate')),
  faculty TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed common programs
INSERT INTO programs (name, slug, duration, degree_level, faculty) VALUES
  ('Bachelor of Information Technology (BIT)', 'bit', '4 Years', 'bachelor', 'IT'),
  ('Bachelor of Science in Computer Science and Information Technology (B.Sc. CSIT)', 'bsc-csit', '4 Years', 'bachelor', 'IT'),
  ('Bachelor of Computer Application (BCA)', 'bca', '3 Years', 'bachelor', 'IT'),
  ('Bachelor of Engineering (BE) in Computer', 'be-computer', '4 Years', 'bachelor', 'Engineering'),
  ('Bachelor of Engineering (BE) in Civil', 'be-civil', '4 Years', 'bachelor', 'Engineering'),
  ('Bachelor of Engineering (BE) in Electronics', 'be-electronics', '4 Years', 'bachelor', 'Engineering'),
  ('Bachelor of Business Administration (BBA)', 'bba', '4 Years', 'bachelor', 'Management'),
  ('Bachelor of Business Management (BBM)', 'bbm', '3 Years', 'bachelor', 'Management'),
  ('Bachelor of Business Studies (BBS)', 'bbs', '4 Years', 'bachelor', 'Management'),
  ('Bachelor of Arts (BA)', 'ba', '4 Years', 'bachelor', 'Humanities'),
  ('Bachelor of Science (B.Sc.)', 'bsc', '4 Years', 'bachelor', 'Science'),
  ('Bachelor of Medicine, Bachelor of Surgery (MBBS)', 'mbbs', '5.5 Years', 'bachelor', 'Medical'),
  ('Bachelor of Pharmacy (B.Pharm)', 'bpharm', '4 Years', 'bachelor', 'Medical'),
  ('Bachelor of Nursing (B.Nurs)', 'bnursing', '4 Years', 'bachelor', 'Medical'),
  ('Bachelor of Education (B.Ed.)', 'bed', '4 Years', 'bachelor', 'Education'),
  ('Bachelor of Law (LLB)', 'llb', '5 Years', 'bachelor', 'Law'),
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  created_at TIMESTAMPTZ DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_programs_slug ON programs(slug);
CREATE INDEX IF NOT EXISTS idx_programs_faculty ON programs(faculty);
CREATE INDEX IF NOT EXISTS idx_results_university ON results(university_id);
CREATE INDEX IF NOT EXISTS idx_results_published ON results(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_notices_university ON notices(university_id);
CREATE INDEX IF NOT EXISTS idx_notices_published ON notices(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_college ON reviews(college_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_scholarships_college ON scholarships(college_id);
CREATE INDEX IF NOT EXISTS idx_college_programs_college ON college_programs(college_id);
CREATE INDEX IF NOT EXISTS idx_college_programs_program ON college_programs(program_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE old_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrance_exams ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read colleges" ON colleges FOR SELECT TO anon USING (true);
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

-- Allow insert for reviews (students can submit)
CREATE POLICY "Anyone can submit review" ON reviews FOR INSERT TO anon WITH CHECK (true);
