import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isStaff } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const VALID_STATUSES = new Set(['new', 'contacted', 'enrolled', 'rejected'])
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(request: Request) {
  if (!(await isStaff())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const status     = searchParams.get('status')
  const college_id = searchParams.get('college_id')
  const requestedLimit = Number.parseInt(searchParams.get('limit') || '100', 10)
  const requestedOffset = Number.parseInt(searchParams.get('offset') || '0', 10)
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 200) : 100
  const offset = Number.isFinite(requestedOffset) ? Math.max(requestedOffset, 0) : 0

  if (status && !VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 })
  }
  if (college_id && !UUID_PATTERN.test(college_id)) {
    return NextResponse.json({ error: 'Invalid college filter' }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()

  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status)     query = query.eq('status', status)
  if (college_id) query = query.eq('college_id', college_id)

  const { data, error, count } = await query

  if (error) {
    console.error('[admin/leads] GET error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json(
    { leads: data, total: count },
    { headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
  )
}
