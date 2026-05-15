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
  created_at: string
  programs?: CollegeProgram[]
  reviews?: Review[]
  scholarships?: Scholarship[]
}

export interface Program {
  id: string
  name: string
  slug: string
  duration: string
  degree_level: 'bachelor' | 'master' | 'mphil' | 'phd' | 'diploma' | 'certificate'
  faculty: string
  created_at: string
}

export interface CollegeProgram {
  college_id: string
  program_id: string
  fee: number | null
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

export interface Result {
  id: string
  title: string
  slug: string
  program: string | null
  semester: string | null
  year: number | null
  university_id: string
  result_url: string | null
  result_pdf_url: string | null
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
  published_date: string
  created_at: string
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
  created_at: string
  program?: Program
  university?: University
}

export type FacultyType = 'IT' | 'Management' | 'Engineering' | 'Medical' | 'Humanities' | 'Science' | 'Education' | 'Law'

export type DegreeLevelType = Program['degree_level']
