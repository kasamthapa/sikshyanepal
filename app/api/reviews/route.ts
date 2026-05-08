import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()
  const { college_id, student_name, program, year, rating, review_text } = body

  if (!college_id || !student_name || !review_text || !rating) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }
  if (review_text.length < 20) {
    return NextResponse.json({ error: 'Review must be at least 20 characters' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('reviews')
    .insert({ college_id, student_name, program, year: year || null, rating, review_text, is_approved: false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, id: data.id })
}
