import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isStaff, writeAudit } from '@/lib/auth'

const isAuthed = isStaff
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!UUID_PATTERN.test(params.id)) {
    return NextResponse.json({ error: 'Invalid enquiry ID' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { status } = body

  const VALID = ['new', 'contacted', 'enrolled', 'rejected']
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', params.id)
    .select('id, status')
    .single()

  if (error) {
    console.error('[admin/leads/:id] PATCH error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  await writeAudit('admission_enquiry.status_update', 'lead', params.id, { status })

  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!UUID_PATTERN.test(params.id)) {
    return NextResponse.json({ error: 'Invalid enquiry ID' }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', params.id)

  if (error) {
    console.error('[admin/leads/:id] DELETE error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  await writeAudit('admission_enquiry.delete', 'lead', params.id)

  return NextResponse.json({ success: true })
}
