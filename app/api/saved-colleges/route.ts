import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type SavedRow = {
  college_id: string
  created_at: string
  college: {
    id: string
    name: string
    slug: string
    location: string
    affiliation: string | null
    education_levels: string[] | null
    verification_status: string
    last_verified_at: string | null
    status: string | null
  } | null
}

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { data, error } = await createAdminSupabaseClient()
    .from('saved_colleges')
    .select('college_id,created_at,college:colleges(id,name,slug,location,affiliation,education_levels,verification_status,last_verified_at,status)')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Your saved colleges could not be loaded.' }, { status: 500 })

  const rows = (data || []) as unknown as SavedRow[]
  const activeRows = rows.filter(item => item.college && (item.college.status === 'active' || item.college.status == null))
  const collegeIds = activeRows.map(item => item.college_id)
  const db = createAdminSupabaseClient()
  const [programsResult, admissionsResult] = collegeIds.length ? await Promise.all([
    db.from('college_programs').select('college_id,fee').in('college_id', collegeIds),
    db.from('admissions').select('college_id').in('college_id', collegeIds).eq('status', 'published').or(`application_open_at.is.null,application_open_at.lte.${new Date().toISOString()}`).or(`application_deadline.is.null,application_deadline.gte.${new Date().toISOString()}`),
  ]) : [{ data: [], error: null }, { data: [], error: null }]
  if (programsResult.error || admissionsResult.error) console.error('[saved-colleges:summary]', programsResult.error || admissionsResult.error)

  const visible = activeRows
    .map(item => ({
      college_id: item.college_id,
      saved_at: item.created_at,
      program_count: programsResult.error ? null : (programsResult.data || []).filter(program => program.college_id === item.college_id).length,
      published_fee_count: programsResult.error ? null : (programsResult.data || []).filter(program => program.college_id === item.college_id && program.fee != null).length,
      open_admission_count: admissionsResult.error ? null : (admissionsResult.data || []).filter(admission => admission.college_id === item.college_id).length,
      college: item.college ? {
        id: item.college.id,
        name: item.college.name,
        slug: item.college.slug,
        location: item.college.location,
        affiliation: item.college.affiliation,
        education_levels: item.college.education_levels,
        verification_status: item.college.verification_status,
        last_verified_at: item.college.last_verified_at,
      } : null,
    }))

  return NextResponse.json(visible, { headers: { 'Cache-Control': 'private, no-store' } })
}
