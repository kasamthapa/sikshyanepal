import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

const collegeFields = 'id,name,slug,location,affiliation,established_year,is_featured,education_levels,facilities,verification_status,last_verified_at'
const slugPattern = /^[a-z0-9-]{1,120}$/i

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim().replace(/\s+/g, ' ').replace(/[%_]/g, '')
  const slugs = Array.from(new Set((searchParams.get('slugs') || '').split(',').filter(Boolean))).slice(0, 3)
  const db = createAdminSupabaseClient()

  if (query) {
    if (query.length < 2 || query.length > 80) return NextResponse.json({ error: 'Enter between 2 and 80 characters.' }, { status: 400 })
    const { data, error } = await db.from('colleges').select(collegeFields).ilike('name', `%${query}%`).or('status.eq.active,status.is.null').order('name').limit(10)
    if (error) { console.error('[college-compare:search]', error); return NextResponse.json({ error: 'College search is temporarily unavailable.' }, { status: 500 }) }
    return NextResponse.json({ colleges: data || [] }, { headers: { 'Cache-Control': 'private, max-age=30' } })
  }

  if (!slugs.length || slugs.some(slug => !slugPattern.test(slug))) return NextResponse.json({ error: 'Choose valid colleges to compare.' }, { status: 400 })
  const { data: colleges, error: collegeError } = await db.from('colleges').select(collegeFields).in('slug', slugs).or('status.eq.active,status.is.null')
  if (collegeError) { console.error('[college-compare:colleges]', collegeError); return NextResponse.json({ error: 'Comparison data is temporarily unavailable.' }, { status: 500 }) }
  const ids = (colleges || []).map(college => college.id)
  if (!ids.length) return NextResponse.json({ colleges: [], details: {} })
  const [programs, reviews, scholarships] = await Promise.all([
    db.from('college_programs').select('college_id,fee,seats,scholarship_available,program:programs(name,degree_level)').in('college_id', ids),
    db.from('reviews').select('college_id,rating').in('college_id', ids).eq('is_approved', true),
    db.from('scholarships').select('college_id').in('college_id', ids).eq('is_active', true),
  ])
  if (programs.error || reviews.error || scholarships.error) { console.error('[college-compare:details]', programs.error || reviews.error || scholarships.error); return NextResponse.json({ error: 'Some comparison details are temporarily unavailable.' }, { status: 500 }) }
  const details = Object.fromEntries(ids.map(id => [id, {
    programs: (programs.data || []).filter(row => row.college_id === id).map(row => ({ fee: row.fee, seats: row.seats, scholarship_available: Boolean(row.scholarship_available), program: row.program })),
    reviews: (reviews.data || []).filter(row => row.college_id === id).map(row => ({ rating: row.rating })),
    scholarships: (scholarships.data || []).filter(row => row.college_id === id).length,
  }]))
  return NextResponse.json({ colleges: colleges || [], details }, { headers: { 'Cache-Control': 'private, max-age=30' } })
}
