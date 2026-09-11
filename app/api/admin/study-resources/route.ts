import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

const tables = { syllabus: 'syllabus', question: 'old_questions' } as const
type ResourceKind = keyof typeof tables
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''

function isValidUrl(value: unknown) {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export async function GET() {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createAdminSupabaseClient()
  const [syllabi, questions, programs, universities] = await Promise.all([
    db.from('syllabus').select('*,program:programs(name),university:universities(name,short_name)').order('created_at', { ascending: false }),
    db.from('old_questions').select('*,program:programs(name),university:universities(name,short_name)').order('created_at', { ascending: false }),
    db.from('programs').select('id,name').order('name'),
    db.from('universities').select('id,name,short_name').order('name'),
  ])
  const error = syllabi.error || questions.error || programs.error || universities.error
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    resources: [
      ...(syllabi.data || []).map(item => ({ ...item, kind: 'syllabus' as const })),
      ...(questions.data || []).map(item => ({ ...item, kind: 'question' as const })),
    ],
    programs: programs.data || [],
    universities: universities.data || [],
  }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: Record<string, unknown>
  try { const parsed: unknown = await request.json(); if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error(); body = parsed as Record<string, unknown> } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  const kind = body.kind as ResourceKind
  if (!(kind in tables)) return NextResponse.json({ error: 'Choose a valid resource type.' }, { status: 400 })
  const name = text(kind === 'syllabus' ? body.title : body.subject, 180)
  const programId=text(body.program_id,36), universityId=text(body.university_id,36)
  if (!name || !uuid.test(programId) || !uuid.test(universityId) || !isValidUrl(body.file_url) || !isValidUrl(body.source_url)) {
    return NextResponse.json({ error: 'Program, university, title, file URL and official source URL are required.' }, { status: 400 })
  }
  const year=body.year?Number(body.year):null
  if(kind==='question'&&year!==null&&(!Number.isInteger(year)||year<1990||year>new Date().getFullYear()+1))return NextResponse.json({error:'Choose a valid question year.'},{status:400})
  const db = createAdminSupabaseClient()
  const [program,university]=await Promise.all([db.from('programs').select('id').eq('id',programId).maybeSingle(),db.from('universities').select('id').eq('id',universityId).maybeSingle()])
  if(program.error||university.error)return NextResponse.json({error:'Could not validate the selected program and university.'},{status:500})
  if(!program.data||!university.data)return NextResponse.json({error:'Choose an existing program and university.'},{status:400})
  const row = {
    program_id: programId,
    university_id: universityId,
    semester: text(body.semester,80) || null,
    ...(kind === 'syllabus' ? { title: name } : { subject: name, year }),
    file_url: text(body.file_url,500),
    source_url: text(body.source_url,500),
    last_verified_at: new Date().toISOString(),
    is_published: Boolean(body.is_published),
  }
  const result = kind === 'syllabus'
    ? await db.from('syllabus').insert(row as { program_id: string; university_id: string; semester: string | null; title: string; file_url: string; source_url: string; last_verified_at: string; is_published: boolean }).select().single()
    : await db.from('old_questions').insert(row as { program_id: string; university_id: string; semester: string | null; subject: string; year: number | null; file_url: string; source_url: string; last_verified_at: string; is_published: boolean }).select().single()
  const { data, error } = result
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('study_resource.create', kind, data.id, { published: row.is_published })
  return NextResponse.json({ ...data, kind }, { status: 201 })
}
