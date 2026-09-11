import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const noStore = { 'Cache-Control': 'private, no-store, max-age=0' }

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!UUID_PATTERN.test(params.id)) return NextResponse.json({ error: 'Invalid college ID' }, { status: 400, headers: noStore })
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ saved: false }, { status: 401, headers: noStore })
  const { data, error } = await createAdminSupabaseClient().from('saved_colleges').select('id').eq('user_id', auth.user.id).eq('college_id', params.id).maybeSingle()
  if (error) { console.error('[saved-colleges:check]', error); return NextResponse.json({ error: 'Your shortlist could not be checked.' }, { status: 500, headers: noStore }) }
  return NextResponse.json({ saved: Boolean(data) }, { headers: noStore })
}

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  if (!UUID_PATTERN.test(params.id)) return NextResponse.json({ error: 'Invalid college ID' }, { status: 400, headers: noStore })
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in required' }, { status: 401, headers: noStore })
  const db = createAdminSupabaseClient()
  const { data: college, error: collegeError } = await db.from('colleges').select('id').eq('id', params.id).or('status.eq.active,status.is.null').maybeSingle()
  if (collegeError) { console.error('[saved-colleges:target]', collegeError); return NextResponse.json({ error: 'This college could not be checked.' }, { status: 503, headers: noStore }) }
  if (!college) return NextResponse.json({ error: 'This college is not available to save.' }, { status: 404, headers: noStore })
  const { error } = await db.from('saved_colleges').upsert({ user_id: auth.user.id, college_id: params.id }, { onConflict: 'user_id,college_id' })
  if (error) { console.error('[saved-colleges:add]', error); return NextResponse.json({ error: 'This college could not be saved.' }, { status: 500, headers: noStore }) }
  return NextResponse.json({ saved: true }, { headers: noStore })
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!UUID_PATTERN.test(params.id)) return NextResponse.json({ error: 'Invalid college ID' }, { status: 400, headers: noStore })
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in required' }, { status: 401, headers: noStore })
  const { error } = await createAdminSupabaseClient().from('saved_colleges').delete().eq('user_id', auth.user.id).eq('college_id', params.id)
  if (error) { console.error('[saved-colleges:remove]', error); return NextResponse.json({ error: 'This college could not be removed.' }, { status: 500, headers: noStore }) }
  return NextResponse.json({ saved: false }, { headers: noStore })
}
