import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isStaff, writeAudit } from '@/lib/auth'
import { sanitizeCollegeAdminPayload } from '@/lib/college-admin'

export const dynamic = 'force-dynamic'

const isAuthed = isStaff
const noStore = { 'Cache-Control': 'private, no-store, max-age=0' }

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore })
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('colleges')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('[admin/colleges:list]', error); return NextResponse.json({ error: 'Colleges could not be loaded.' }, { status: 500, headers: noStore }) }
  return NextResponse.json(data, { headers: noStore })
}

export async function POST(request: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore })
  const body = await request.json().catch(() => null)
  const parsed = sanitizeCollegeAdminPayload(body, 'create')
  if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400, headers: noStore })
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('colleges')
    .insert(parsed.data!)
    .select()
    .single()
  if (error) { console.error('[admin/colleges:create]', error); return NextResponse.json({ error: error.code === '23505' ? 'A college with this slug already exists.' : 'The college could not be created.' }, { status: error.code === '23505' ? 409 : 500, headers: noStore }) }
  await writeAudit('college.create', 'college', data.id, { name: data.name })
  return NextResponse.json(data, { status: 201, headers: noStore })
}
