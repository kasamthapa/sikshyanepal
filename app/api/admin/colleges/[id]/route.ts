import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isStaff, writeAudit } from '@/lib/auth'
import { sanitizeCollegeAdminPayload } from '@/lib/college-admin'

const isAuthed = isStaff
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const noStore = { 'Cache-Control': 'private, no-store, max-age=0' }

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore })
  if (!UUID.test(params.id)) return NextResponse.json({ error: 'Invalid college ID.' }, { status: 400, headers: noStore })
  const body = await request.json().catch(() => null)
  const parsed = sanitizeCollegeAdminPayload(body, 'update')
  if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400, headers: noStore })
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('colleges')
    .update(parsed.data!)
    .eq('id', params.id)
    .select()
    .single()
  if (error) { console.error('[admin/colleges:update]', error); return NextResponse.json({ error: error.code === '23505' ? 'A college with this slug already exists.' : 'The college could not be updated.' }, { status: error.code === '23505' ? 409 : 500, headers: noStore }) }
  await writeAudit('college.update', 'college', params.id, { name: data.name, fields: Object.keys(parsed.data!).filter(key => key !== 'updated_at') })
  return NextResponse.json(data, { headers: noStore })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore })
  if (!UUID.test(params.id)) return NextResponse.json({ error: 'Invalid college ID.' }, { status: 400, headers: noStore })
  const supabase = createAdminSupabaseClient()
  const { data: college, error: lookupError } = await supabase.from('colleges').select('id,name,status').eq('id', params.id).single()
  if (lookupError || !college) return NextResponse.json({ error: 'College not found.' }, { status: 404, headers: noStore })
  if (college.status === 'pending_review') {
    const { error } = await supabase.from('colleges').delete().eq('id', params.id).eq('status', 'pending_review')
    if (error) { console.error('[admin/colleges:reject]', error); return NextResponse.json({ error: 'The pending submission could not be rejected.' }, { status: 500, headers: noStore }) }
    await writeAudit('college.reject_delete', 'college', params.id, { name: college.name })
    return NextResponse.json({ success: true, action: 'deleted' }, { headers: noStore })
  }
  const { error } = await supabase.from('colleges').update({ status: 'inactive', is_featured: false, updated_at: new Date().toISOString() }).eq('id', params.id)
  if (error) { console.error('[admin/colleges:archive]', error); return NextResponse.json({ error: 'The college could not be archived.' }, { status: 500, headers: noStore }) }
  await writeAudit('college.archive', 'college', params.id, { name: college.name, previous_status: college.status })
  return NextResponse.json({ success: true, action: 'archived' }, { headers: noStore })
}
