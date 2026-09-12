import { isStaff } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

const checks = [
  { table: 'schools', label: 'School directory', select: 'id' },
  { table: 'admissions', label: 'Admissions engine', select: 'id' },
  { table: 'scholarships', label: 'Scholarships', select: 'id' },
  { table: 'opportunities', label: 'Opportunities', select: 'id' },
  { table: 'news', label: 'Newsroom', select: 'id' },
  { table: 'entrance_exams', label: 'Entrance exams publishing', select: 'id,status' },
  { table: 'syllabus', label: 'Published syllabus resources', select: 'id,is_published' },
  { table: 'old_questions', label: 'Published old questions', select: 'id,is_published' },
  { table: 'community_posts', label: 'Moderated community', select: 'id,status,public_alias' },
  { table: 'community_comments', label: 'Community comments', select: 'id,status' },
  { table: 'community_reports', label: 'Community reporting', select: 'id,status' },
  { table: 'content_sources', label: 'Source registry', select: 'id' },
  { table: 'content_ingestion_items', label: 'Editorial ingestion queue', select: 'id,verification_status,confidence_score' },
  { table: 'profiles', label: 'Role-based accounts', select: 'id' },
  { table: 'programs', label: 'Program discovery', select: 'id' },
  { table: 'institution_claims', label: 'Institution claims', select: 'id' },
  { table: 'college_evidence', label: 'College evidence ledger', select: 'id,field_key,source_url' },
  { table: 'college_programs', label: 'Fee context', select: 'id,fee_period,fee_last_verified_at' },
  { table: 'review_verifications', label: 'Verified reviews', select: 'id' },
  { table: 'admission_deadline_history', label: 'Deadline history', select: 'id' },
  { table: 'review_responses', label: 'Institution review responses', select: 'id' },
  { table: 'search_events', label: 'Search insights', select: 'id' },
] as const

export async function GET() {
  if (!(await isStaff(['editor', 'owner']))) return NextResponse.json({ error: 'Editor access required' }, { status: 403 })
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  const communitySecurityConfigured = Boolean(process.env.COMMUNITY_HASH_SALT && process.env.COMMUNITY_HASH_SALT.length >= 32)
  if (!configured) return NextResponse.json({ configured: false, communitySecurityConfigured, checks: checks.map(({ table, label }) => ({ table, label, ready: false, detail: 'Private Supabase server credentials are missing.' })) })
  const db = createAdminSupabaseClient()
  const results = await Promise.all(checks.map(async ({ table, label, select }) => {
    const { error } = await db.from(table).select(select, { head: true, count: 'exact' }).limit(1)
    return { table, label, ready: !error, detail: error ? (error.code === '42P01' ? 'Table is missing: apply its migration.' : error.code === '42703' ? `Required column is missing: ${error.message}` : error.message) : 'Ready' }
  }))
  return NextResponse.json({ configured: true, communitySecurityConfigured, checks: results })
}
