import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isPathStage, levelFitsStage, taskForStage, type PathStage } from '@/lib/my-path'

function setupError(message: string) {
  return NextResponse.json({ error: message, setupRequired: true }, { status: 503 })
}

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const db = createAdminSupabaseClient()
  const now = new Date()
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  const [profile, tasks, colleges, schools, admissions, scholarships, exams, opportunities] = await Promise.all([
    db.from('student_path_profiles').select('current_stage').eq('user_id', auth.user.id).maybeSingle(),
    db.from('student_path_tasks').select('id,task_key,title,is_completed').eq('user_id', auth.user.id).order('created_at'),
    db.from('saved_colleges').select('college:colleges(id,name,slug,location)').eq('user_id', auth.user.id).limit(5),
    db.from('saved_schools').select('school:schools(id,name,slug,district,province)').eq('user_id', auth.user.id).limit(5),
    db.from('admissions').select('id,title,slug,application_deadline,institution_name,education_level,source_url,last_verified_at').eq('status', 'published').gte('application_deadline', today).order('application_deadline').limit(40),
    db.from('scholarships').select('id,title,deadline,amount,education_levels,application_url,source_url,last_verified_at').eq('is_active', true).gte('deadline', today).order('deadline').limit(40),
    db.from('entrance_exams').select('id,title,application_deadline,education_level,exam_url,source_url,last_verified_at').eq('status', 'published').gte('application_deadline', today).order('application_deadline').limit(40),
    db.from('student_opportunities').select('id,title,organisation,opportunity_type,deadline,application_url,source_url,last_verified_at').eq('is_published', true).gte('deadline', today).order('deadline').limit(40),
  ])

  if (profile.error?.code === '42P01' || tasks.error?.code === '42P01') {
    return setupError('The My Path database setup has not been applied yet.')
  }
  const coreError = profile.error || tasks.error
  if (coreError) { console.error('[my-path:get:core]', coreError); return NextResponse.json({ error: 'Your private plan is temporarily unavailable. Please try again.' }, { status: 500 }) }
  const optionalResults = { shortlist: colleges.error || schools.error, admissions: admissions.error, scholarships: scholarships.error, exams: exams.error, opportunities: opportunities.error }
  const unavailable = Object.entries(optionalResults).filter(([, error]) => Boolean(error)).map(([section]) => section)
  if (unavailable.length) console.error('[my-path:get:partial]', optionalResults)

  const candidateStage = profile.data?.current_stage
  const stage: PathStage | null = isPathStage(candidateStage) ? candidateStage : null
  const levelMatches = (level: string | null | undefined) => levelFitsStage(stage, level)
  const deadlineEpoch = (value: string | null | undefined) => {
    if (!value) return Number.POSITIVE_INFINITY
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T23:59:59+05:45`).getTime()
      : new Date(value).getTime()
    return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY
  }
  const matchingAdmissions = (admissions.data || []).filter((item) => levelMatches(item.education_level))
  const recommendations = [
    ...(exams.data || []).filter((item) => levelMatches(item.education_level)).map((item) => ({ id: item.id, type: 'exam' as const, title: item.title, detail: item.education_level || 'Entrance exam', deadline: item.application_deadline, href: item.exam_url || item.source_url || '/entrance-exams', sourceUrl: item.source_url, checkedAt: item.last_verified_at })),
    ...(scholarships.data || []).filter((item) => !item.education_levels?.length || item.education_levels.some(levelMatches)).map((item) => ({ id: item.id, type: 'scholarship' as const, title: item.title, detail: item.amount ? `NPR ${Number(item.amount).toLocaleString()}` : 'Funding opportunity', deadline: item.deadline, href: item.application_url || item.source_url || '/scholarships', sourceUrl: item.source_url, checkedAt: item.last_verified_at })),
    ...(opportunities.data || []).filter(() => stage !== 'grade_10').map((item) => ({ id: item.id, type: 'opportunity' as const, title: item.title, detail: `${item.opportunity_type} · ${item.organisation}`, deadline: item.deadline, href: item.application_url || '/opportunities', sourceUrl: item.source_url, checkedAt: item.last_verified_at })),
  ].sort((a, b) => deadlineEpoch(a.deadline) - deadlineEpoch(b.deadline)).slice(0, 6)
  const nextDeadline = [
    ...matchingAdmissions.map((item) => ({ id: item.id, type: 'admission' as const, title: item.title, detail: item.institution_name || item.education_level || 'Admission', deadline: item.application_deadline, href: `/admissions/${item.slug}`, sourceUrl: item.source_url, checkedAt: item.last_verified_at })),
    ...recommendations,
  ].filter((item) => deadlineEpoch(item.deadline) >= now.getTime())
    .sort((a, b) => deadlineEpoch(a.deadline) - deadlineEpoch(b.deadline))[0] || null

  return NextResponse.json({
    name: auth.profile.full_name || auth.user.email?.split('@')[0] || 'Student',
    stage,
    tasks: tasks.data || [],
    savedColleges: colleges.data || [],
    savedSchools: schools.data || [],
    admissions: matchingAdmissions.slice(0, 5),
    scholarships: (scholarships.data || []).filter((item) => !item.education_levels?.length || item.education_levels.some(levelMatches)).slice(0, 4),
    recommendations,
    nextDeadline,
    unavailable,
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function POST(request: Request) {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  let body: { stage?: unknown; task?: { key?: unknown; title?: unknown; completed?: unknown } }
  try { const parsed: unknown = await request.json(); if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error(); body = parsed as typeof body } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  if (body.stage === undefined && !body.task) return NextResponse.json({ error: 'No path update was provided.' }, { status: 400 })
  const db = createAdminSupabaseClient()

  if (body.stage !== undefined) {
    if (!isPathStage(body.stage)) return NextResponse.json({ error: 'Choose a valid stage.' }, { status: 400 })
    const { error } = await db.from('student_path_profiles').upsert({ user_id: auth.user.id, current_stage: body.stage, updated_at: new Date().toISOString() })
    if (error?.code === '42P01') return setupError('The My Path database setup has not been applied yet.')
    if (error) { console.error('[my-path:stage]', error); return NextResponse.json({ error: 'Your stage could not be saved.' }, { status: 500 }) }
  }

  if (body.task) {
    if (typeof body.task.key !== 'string' || typeof body.task.completed !== 'boolean') return NextResponse.json({ error: 'Choose a valid checklist action.' }, { status: 400 })
    const { data: profile, error: profileError } = await db.from('student_path_profiles').select('current_stage').eq('user_id', auth.user.id).maybeSingle()
    if (profileError?.code === '42P01') return setupError('The My Path database setup has not been applied yet.')
    if (profileError || !isPathStage(profile?.current_stage)) return NextResponse.json({ error: 'Choose your current stage before updating tasks.' }, { status: 409 })
    const template = taskForStage(profile.current_stage, body.task.key)
    if (!template) return NextResponse.json({ error: 'That action does not belong to your current path.' }, { status: 400 })
    const { error } = await db.from('student_path_tasks').upsert({
      user_id: auth.user.id,
      task_key: template.key,
      title: template.title,
      is_completed: body.task.completed,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,task_key' })
    if (error?.code === '42P01') return setupError('The My Path database setup has not been applied yet.')
    if (error) { console.error('[my-path:task]', error); return NextResponse.json({ error: 'Your task could not be saved.' }, { status: 500 }) }
  }

  return NextResponse.json({ ok: true })
}
