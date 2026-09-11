import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let is_published: unknown
  try { const body: unknown = await request.json(); if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error(); is_published = (body as {is_published?:unknown}).is_published } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  if (typeof is_published !== 'boolean') return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  if (is_published) {
    const { data: item, error: readError } = await createAdminSupabaseClient().from('student_opportunities').select('deadline,application_url,source_url').eq('id', params.id).maybeSingle()
    if (readError || !item) return NextResponse.json({ error: 'Opportunity not found.' }, { status: 404 })
    if (!item.application_url || !item.source_url) return NextResponse.json({ error: 'Official application and source links are required before publishing.' }, { status: 400 })
    if (item.deadline && new Date(item.deadline).getTime() < Date.now()) return NextResponse.json({ error: 'Update the expired deadline before publishing.' }, { status: 400 })
  }
  const now = new Date().toISOString()
  const { data, error } = await createAdminSupabaseClient().from('student_opportunities').update({ is_published, is_verified: is_published, last_verified_at: now, updated_at: now }).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('opportunity.publish', 'student_opportunity', params.id, { is_published })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await createAdminSupabaseClient().from('student_opportunities').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('opportunity.delete', 'student_opportunity', params.id)
  return NextResponse.json({ success: true })
}
