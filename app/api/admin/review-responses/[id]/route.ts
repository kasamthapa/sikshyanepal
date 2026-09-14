import { getAuthContext, isStaff, writeAudit } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isStaff(['editor', 'owner']))) return NextResponse.json({ error: 'Editor access required' }, { status: 403 })
  const { status } = await request.json().catch(() => ({}))
  if (!['published', 'rejected'].includes(status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  const auth = await getAuthContext()
  const { data, error } = await createAdminSupabaseClient().from('review_responses').update({ status, reviewed_at: new Date().toISOString(), reviewed_by: auth?.user.id || null }).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('review_response_moderated', 'review_response', params.id, { status })
  return NextResponse.json(data)
}
