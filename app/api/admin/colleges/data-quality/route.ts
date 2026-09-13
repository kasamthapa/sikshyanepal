import { NextResponse } from 'next/server'
import { isStaff } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store, max-age=0' }

export async function GET() {
  if (!(await isStaff(['editor', 'owner']))) return NextResponse.json({ error: 'Editor access required' }, { status: 403, headers })
  const db = createAdminSupabaseClient()
  const [{ data: colleges, error: collegeError }, { data: links, error: linkError }] = await Promise.all([
    db.from('colleges').select('id,name,slug,province,district,location,phone,email,website,source_name,source_url,last_verified_at,verification_status,status,average_fee_min,average_fee_max,fee_source_url,fee_last_verified_at').order('name'),
    db.from('college_programs').select('college_id,fee'),
  ])
  if (collegeError) return NextResponse.json({ error: 'College records could not be loaded.' }, { status: 500, headers })
  if (linkError) return NextResponse.json({ error: 'Programme links could not be loaded.' }, { status: 500, headers })
  const now = Date.now()
  const byCollege = new Map<string, { count: number; fees: number }>()
  for (const row of links || []) {
    const current = byCollege.get(row.college_id) || { count: 0, fees: 0 }
    current.count += 1
    if (row.fee != null) current.fees += 1
    byCollege.set(row.college_id, current)
  }
  const rows = (colleges || []).filter((c) => c.status !== 'inactive').map((c) => {
    const related = byCollege.get(c.id) || { count: 0, fees: 0 }
    const stale = !c.last_verified_at || now - new Date(c.last_verified_at).getTime() > 180 * 86400000
    const gaps: string[] = []
    if (!related.count) gaps.push('No programmes')
    if (!c.website) gaps.push('Missing website')
    if (!c.phone && !c.email) gaps.push('Missing contact')
    if (!c.source_url) gaps.push('Missing source')
    if (!c.last_verified_at) gaps.push('Never verified')
    else if (stale) gaps.push('Verification stale')
    if (c.average_fee_min == null && c.average_fee_max == null && !related.fees) gaps.push('Missing fee data')
    if ((c.average_fee_min != null || c.average_fee_max != null || related.fees) && (!c.fee_last_verified_at || now - new Date(c.fee_last_verified_at).getTime() > 180 * 86400000)) gaps.push('Fee verification stale')
    return { ...c, programme_count: related.count, fee_count: related.fees, gaps, priority: gaps.length }
  }).sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name))
  const summary = {
    total: rows.length,
    needs_attention: rows.filter((r) => r.priority > 0).length,
    complete: rows.filter((r) => r.priority === 0).length,
    gaps: Object.fromEntries(Array.from(new Set(rows.flatMap((r) => r.gaps))).map((gap) => [gap, rows.filter((r) => r.gaps.includes(gap)).length])),
  }
  return NextResponse.json({ summary, rows, generated_at: new Date().toISOString() }, { headers })
}
