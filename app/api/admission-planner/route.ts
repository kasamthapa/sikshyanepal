import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

const statuses = ['not_started', 'documents_ready', 'applied', 'entrance', 'enrolled']
const checklistKeys = ['official_notice', 'documents', 'payment', 'deadline']
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const noStore = { 'Cache-Control': 'private, no-store, max-age=0' }
const admissionFields = 'id,title,slug,institution_name,application_open_at,application_deadline,education_level,source_url,verification_status,last_verified_at'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in required' }, { status: 401, headers: noStore })
  const db = createAdminSupabaseClient()
  const [plans, admissions] = await Promise.all([
    db.from('student_admission_plans').select(`id,status,checklist,notes,admission:admissions(${admissionFields})`).eq('user_id', auth.user.id).order('updated_at', { ascending: false }),
    db.from('admissions').select(admissionFields).eq('status', 'published').or(`application_deadline.is.null,application_deadline.gte.${new Date().toISOString()}`).order('application_deadline', { ascending: true, nullsFirst: false }).limit(20),
  ])
  if (plans.error?.code === '42P01') return NextResponse.json({ error: 'The admission-planner database setup has not been applied yet.', setupRequired: true }, { status: 503, headers: noStore })
  if (plans.error || admissions.error) {
    console.error('[admission-planner:get]', plans.error || admissions.error)
    return NextResponse.json({ error: 'Your admission planner is temporarily unavailable. Please try again.' }, { status: 500, headers: noStore })
  }
  return NextResponse.json({ plans: plans.data || [], admissions: admissions.data || [] }, { headers: noStore })
}

export async function POST(request: Request) {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in required' }, { status: 401, headers: noStore })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body || typeof body.admission_id !== 'string' || !UUID_PATTERN.test(body.admission_id) || !statuses.includes(String(body.status))) {
    return NextResponse.json({ error: 'A valid admission and status are required.' }, { status: 400, headers: noStore })
  }

  const db = createAdminSupabaseClient()
  const [admissionResult, existingResult] = await Promise.all([
    db.from('admissions').select('id,status').eq('id', body.admission_id).maybeSingle(),
    db.from('student_admission_plans').select('id').eq('user_id', auth.user.id).eq('admission_id', body.admission_id).maybeSingle(),
  ])
  if (existingResult.error?.code === '42P01') return NextResponse.json({ error: 'The admission-planner database setup has not been applied yet.', setupRequired: true }, { status: 503, headers: noStore })
  if (admissionResult.error || existingResult.error) {
    console.error('[admission-planner:validate]', admissionResult.error || existingResult.error)
    return NextResponse.json({ error: 'This admission could not be checked.' }, { status: 503, headers: noStore })
  }
  if (!admissionResult.data || (!existingResult.data && admissionResult.data.status !== 'published')) {
    return NextResponse.json({ error: 'This admission is not available to add.' }, { status: 404, headers: noStore })
  }

  const checklist = body.checklist && typeof body.checklist === 'object' && !Array.isArray(body.checklist)
    ? Object.fromEntries(Object.entries(body.checklist).filter(([key, value]) => checklistKeys.includes(key) && typeof value === 'boolean'))
    : {}
  const { error } = await db.from('student_admission_plans').upsert({
    user_id: auth.user.id,
    admission_id: body.admission_id,
    status: body.status,
    checklist,
    notes: typeof body.notes === 'string' ? body.notes.trim().slice(0, 1000) || null : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,admission_id' })
  if (error?.code === '42P01') return NextResponse.json({ error: 'The admission-planner database setup has not been applied yet.', setupRequired: true }, { status: 503, headers: noStore })
  if (error) { console.error('[admission-planner:save]', error); return NextResponse.json({ error: 'Your planner change could not be saved. Please try again.' }, { status: 500, headers: noStore }) }
  return NextResponse.json({ ok: true }, { headers: noStore })
}

export async function DELETE(request: Request) {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in required' }, { status: 401, headers: noStore })
  const admissionId = new URL(request.url).searchParams.get('admission_id') || ''
  if (!UUID_PATTERN.test(admissionId)) return NextResponse.json({ error: 'A valid admission is required.' }, { status: 400, headers: noStore })
  const { error } = await createAdminSupabaseClient().from('student_admission_plans').delete().eq('user_id', auth.user.id).eq('admission_id', admissionId)
  if (error?.code === '42P01') return NextResponse.json({ error: 'The admission-planner database setup has not been applied yet.', setupRequired: true }, { status: 503, headers: noStore })
  if (error) { console.error('[admission-planner:remove]', error); return NextResponse.json({ error: 'This application could not be removed.' }, { status: 500, headers: noStore }) }
  return NextResponse.json({ ok: true }, { headers: noStore })
}
