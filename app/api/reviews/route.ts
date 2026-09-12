import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { getAuthContext } from '@/lib/auth'
import { cleanCommunityText, containsPersonalContact } from '@/lib/community-server'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const categoryFields = ['teaching_rating', 'facilities_rating', 'administration_rating', 'value_rating', 'placement_rating', 'attendance_rating', 'safety_rating', 'internship_support_rating'] as const
const noStore = { 'Cache-Control': 'private, no-store, max-age=0' }

function validStudyYear(value: unknown) {
  if (value == null || value === '') return null
  const year = Number(value)
  const nextAdYear = new Date().getFullYear() + 1
  return Number.isInteger(year) && ((year >= 1990 && year <= nextAdYear) || (year >= 2050 && year <= 2100)) ? year : NaN
}

export async function POST(request: Request) {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in before submitting a review.' }, { status: 401, headers: noStore })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Invalid review submission.' }, { status: 400, headers: noStore })

  const collegeId = cleanCommunityText(body.college_id)
  const studentName = cleanCommunityText(body.student_name).slice(0, 60)
  const program = cleanCommunityText(body.program).slice(0, 100) || null
  const reviewText = cleanCommunityText(body.review_text)
  const hostelNote = cleanCommunityText(body.hostel_transport_note).slice(0, 300) || null
  const evidenceUrl = cleanCommunityText(body.evidence_url).slice(0, 1000) || null
  const rating = Number(body.rating)
  const year = validStudyYear(body.year)

  if (!UUID_PATTERN.test(collegeId) || studentName.length < 3 || reviewText.length < 20 || reviewText.length > 3000) {
    return NextResponse.json({ error: 'Choose a valid college and use a 3–60 character public name with a 20–3,000 character review.' }, { status: 400, headers: noStore })
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be a whole number between 1 and 5.' }, { status: 400, headers: noStore })
  if (Number.isNaN(year)) return NextResponse.json({ error: 'Use a valid AD or BS study year.' }, { status: 400, headers: noStore })
  if (containsPersonalContact(`${studentName} ${reviewText} ${hostelNote || ''}`)) return NextResponse.json({ error: 'Remove phone numbers, email addresses, social handles and precise private locations.' }, { status: 400, headers: noStore })
  if (evidenceUrl && !/^https:\/\/[^\s]+$/i.test(evidenceUrl)) return NextResponse.json({ error: 'Evidence URL must be a valid HTTPS link.' }, { status: 400, headers: noStore })

  const ratings: Record<string, number | null> = {}
  for (const field of categoryFields) {
    if (body[field] == null || Number(body[field]) === 0) { ratings[field] = null; continue }
    const value = Number(body[field])
    if (!Number.isInteger(value) || value < 1 || value > 5) return NextResponse.json({ error: 'Category ratings must be whole numbers between 1 and 5.' }, { status: 400, headers: noStore })
    ratings[field] = value
  }

  const db = createAdminSupabaseClient()
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const [collegeResult, recentResult] = await Promise.all([
    db.from('colleges').select('id').eq('id', collegeId).or('status.eq.active,status.is.null').maybeSingle(),
    db.from('reviews').select('id', { count: 'exact', head: true }).eq('author_id', auth.user.id).eq('college_id', collegeId).gte('created_at', since),
  ])
  if (collegeResult.error || recentResult.error) {
    console.error('[reviews:validation]', collegeResult.error || recentResult.error)
    return NextResponse.json({ error: 'Review safety checks are temporarily unavailable.' }, { status: 503, headers: noStore })
  }
  if (!collegeResult.data) return NextResponse.json({ error: 'This college is not available for reviews.' }, { status: 404, headers: noStore })
  if ((recentResult.count || 0) > 0) return NextResponse.json({ error: 'You already submitted a review for this college in the last 30 days.' }, { status: 429, headers: noStore })

  const { data, error } = await db.from('reviews').insert({
    college_id: collegeId,
    student_name: studentName,
    program,
    year,
    rating,
    review_text: reviewText,
    is_approved: false,
    author_id: auth.user.id,
    ...ratings,
    hidden_costs_reported: body.hidden_costs_reported === true,
    hostel_transport_note: hostelNote,
    verification_status: evidenceUrl ? 'submitted' : 'unverified',
  }).select('id').single()
  if (error) { console.error('[reviews:insert]', error); return NextResponse.json({ error: 'Your review could not be saved.' }, { status: 500, headers: noStore }) }

  if (evidenceUrl) {
    const { error: evidenceError } = await db.from('review_verifications').insert({ review_id: data.id, evidence_url: evidenceUrl })
    if (evidenceError) {
      console.error('[reviews:evidence]', evidenceError)
      const { error: cleanupError } = await db.from('reviews').delete().eq('id', data.id).eq('author_id', auth.user.id)
      if (cleanupError) console.error('[reviews:evidence-cleanup]', cleanupError)
      return NextResponse.json({ error: 'Private verification evidence could not be saved, so the review was not submitted.' }, { status: 503, headers: noStore })
    }
  }
  return NextResponse.json({ success: true, id: data.id }, { status: 201, headers: noStore })
}
