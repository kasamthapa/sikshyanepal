import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isStaff } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' }

export async function GET() {
  if (!(await isStaff())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*, college:colleges(id, name, slug)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/reviews] GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  }
  return NextResponse.json(data ?? [], { headers: NO_CACHE })
}
