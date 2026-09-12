export interface College {
  id: string
  name: string
  slug: string
  description: string | null
  location: string
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  logo_url: string | null
  cover_url: string | null
  affiliation: string | null
  established_year: number | null
  is_featured: boolean
  is_sponsored?: boolean
  sponsor_label?: string | null
  sponsor_starts_at?: string | null
  sponsor_ends_at?: string | null
  sponsor_position?: number | null
  sponsor_disclosure?: string | null
  /** 'active' (default / null means active) | 'pending_review' */
  status: string | null
  /** 'manual' | 'scraped' | 'public_submission' */
  source: string | null
  programs_offered: string | null
  submitted_by: string | null
  submitter_role: string | null
  submitter_contact: string | null
  province?: string | null
  district?: string | null
  local_level?: string | null
  ward_number?: number | null
  verification_status?: VerificationStatus
  source_name?: string | null
  source_url?: string | null
  last_verified_at?: string | null
  verified_by?: string | null
  education_levels?: ('plus_two' | 'bachelor' | 'master' | 'mphil' | 'phd' | 'diploma' | 'certificate')[]
  created_at: string
  updated_at?: string | null
  programs?: CollegeProgram[]
  reviews?: Review[]
  scholarships?: Scholarship[]
}

export type VerificationStatus = 'unverified' | 'source_verified' | 'institution_verified'

export interface School {
  id: string
  iemis_code: string | null
  name: string
  slug: string
  description: string | null
  ownership_type: 'community' | 'institutional' | 'religious' | 'public' | 'private' | 'other' | null
  school_level: 'pre_primary' | 'basic' | 'secondary' | 'multiple' | null
  grades_from: number | null
  grades_to: number | null
  province: string
  district: string
  local_level: string | null
  ward_number: number | null
  location: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  email: string | null
  website: string | null
  logo_url: string | null
  cover_url: string | null
  principal_name: string | null
  medium_of_instruction: string[] | null
  streams: string[] | null
  facilities: string[] | null
  student_count: number | null
  teacher_count: number | null
  established_year: number | null
  status: 'active' | 'pending_review' | 'inactive'
  verification_status: VerificationStatus
  source_name: string | null
  source_url: string | null
  source_published_at: string | null
  last_verified_at: string | null
  verified_by: string | null
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface Admission {
  id: string
  title: string
  slug: string
  institution_type: 'school' | 'college' | 'university' | 'training_provider' | 'other'
  institution_name: string
  school_id: string | null
  college_id: string | null
  programs: string[]
  education_level: string | null
  admission_type: 'general' | 'entrance' | 'scholarship' | 'quota' | 'transfer' | 'other'
  summary: string | null
  details: string | null
  eligibility: string | null
  required_documents: string[]
  application_open_at: string | null
  application_deadline: string | null
  entrance_exam_at: string | null
  application_fee: number | null
  available_seats: number | null
  application_url: string | null
  contact_phone: string | null
  contact_email: string | null
  source_name: string
  source_url: string
  verification_status: VerificationStatus
  last_verified_at: string | null
  status: 'draft' | 'published' | 'closed' | 'archived'
  is_featured: boolean
  is_sponsored: boolean
  sponsor_label: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  school?: Pick<School, 'id' | 'name' | 'slug' | 'district' | 'province'> | null
  college?: Pick<College, 'id' | 'name' | 'slug' | 'location'> | null
}

export interface Program {
  id: string
  name: string
  slug: string
  duration: string
  degree_level: '+2' | 'bachelor' | 'master' | 'mphil' | 'phd' | 'diploma' | 'certificate'
  faculty: string
  overview?: string | null
  eligibility?: string | null
  entrance_requirements?: string | null
  curriculum_highlights?: string[]
  career_paths?: string[]
  average_fee_min?: number | null
  average_fee_max?: number | null
  source_url?: string | null
  last_verified_at?: string | null
  updated_at?: string
  created_at: string
}

export interface CollegeProgram {
  id?: string
  college_id: string
  program_id: string
  fee: number | null
  fee_period?: 'monthly' | 'semester' | 'annual' | 'total_program' | 'one_time' | 'unknown'
  fee_academic_year?: string | null
  fee_source_url?: string | null
  fee_last_verified_at?: string | null
  seats: number | null
  scholarship_available: boolean
  program?: Program
  college?: College
}

export interface University {
  id: string
  name: string
  slug: string
  short_name: string
  website: string | null
  created_at: string
}

export interface EntranceExam {
  id: string
  title: string
  slug: string
  university_id: string | null
  program: string | null
  exam_body: string | null
  education_level: string | null
  exam_date: string | null
  application_deadline: string | null
  fee: number | null
  description: string | null
  eligibility: string | null
  exam_url: string | null
  syllabus_url: string | null
  source_name: string | null
  source_url: string | null
  last_verified_at: string | null
  status: 'draft' | 'published' | 'closed'
  created_at: string
  updated_at: string
  university?: University | null
}

export interface Result {
  id: string
  title: string
  slug: string
  program: string | null
  semester: string | null
  year: number | null
  university_id: string
  result_url: string | null
  result_pdf_url: string | null   // holds PDF or image URL; check content_type
  content_type: 'pdf' | 'image' | 'link' | null
  published_date: string
  created_at: string
  university?: University
}

export interface Notice {
  id: string
  title: string
  slug: string
  content: string | null
  university_id: string
  notice_url: string | null
  notice_pdf_url: string | null   // holds PDF or image URL; check content_type
  content_type: 'pdf' | 'image' | 'link' | null
  published_date: string
  created_at: string
  university?: University
}

export interface News {
  id: string
  title: string
  slug: string
  content: string | null
  image_url: string | null
  news_pdf_url: string | null   // holds PDF or image URL; check content_type
  content_type: 'pdf' | 'image' | 'link' | null
  published_date: string
  created_at: string
  author_name?: string
  source_name?: string | null
  source_url?: string | null
  last_verified_at?: string | null
  updated_at?: string
  status?: 'draft' | 'published' | 'archived'
  content_category?: 'college_news' | 'admission' | 'achievement' | 'entrance_result' | 'event' | 'award' | 'scholarship' | 'ranking_methodology' | 'policy'
  education_levels?: string[]
  college_id?: string | null
  automation_mode?: 'manual' | 'auto_published' | 'editor_approved'
  disclosure?: string | null
}

export interface Review {
  id: string
  college_id: string
  rating: number
  review_text: string
  student_name: string
  program: string | null
  year: number | null
  is_approved: boolean
  teaching_rating?: number | null
  facilities_rating?: number | null
  administration_rating?: number | null
  value_rating?: number | null
  placement_rating?: number | null
  attendance_rating?: number | null
  safety_rating?: number | null
  internship_support_rating?: number | null
  hidden_costs_reported?: boolean
  hostel_transport_note?: string | null
  verification_status?: 'unverified' | 'submitted' | 'verified' | 'rejected'
  created_at: string
  college?: College
}

export interface Scholarship {
  id: string
  college_id: string | null
  title: string
  description: string | null
  amount: number | null
  deadline: string | null
  eligibility: string | null
  application_url: string | null
  is_active: boolean
  provider_name?: string | null
  scholarship_type?: string | null
  education_levels?: string[]
  target_groups?: string[]
  coverage?: string | null
  source_name?: string | null
  source_url?: string | null
  last_verified_at?: string | null
  created_at: string
  college?: College
}

export interface Syllabus {
  id: string
  program_id: string
  university_id: string
  semester: string | null
  title: string
  file_url: string | null
  source_url?: string | null
  last_verified_at?: string | null
  is_published?: boolean
  created_at: string
  program?: Program
  university?: University
}

export interface OldQuestion {
  id: string
  program_id: string
  university_id: string
  semester: string | null
  year: number | null
  subject: string
  file_url: string | null
  source_url?: string | null
  last_verified_at?: string | null
  is_published?: boolean
  created_at: string
  program?: Program
  university?: University
}

export interface Lead {
  id: string
  college_id: string
  college_name: string
  student_name: string
  student_email: string | null
  student_phone: string
  program_interest: string | null
  message: string | null
  /** 'new' | 'contacted' | 'enrolled' | 'rejected' */
  status: 'new' | 'contacted' | 'enrolled' | 'rejected'
  created_at: string
}

export type FacultyType = 'IT' | 'Management' | 'Engineering' | 'Medical' | 'Humanities' | 'Science' | 'Education' | 'Law'

export type DegreeLevelType = Program['degree_level']
