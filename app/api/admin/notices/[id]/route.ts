import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isStaff } from '@/lib/auth'
import { recordReviewIssues } from '@/lib/editorial-quality'

const isAuthed = isStaff

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const issues = recordReviewIssues({ title: body.title, content: body.content, sourceUrl: body.notice_url, publishedDate: body.published_date })
  if (issues.length) return NextResponse.json({ error: `Review before publishing: ${issues.join('; ')}.` }, { status: 400 })
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase.from('notices').update(body).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminSupabaseClient()
  const { error } = await supabase.from('notices').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
