import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import { isStaff } from '@/lib/auth'
import { recordReviewIssues } from '@/lib/editorial-quality'

export const dynamic = 'force-dynamic'

const isAuthed = isStaff

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('notices')
    .select('*, university:universities(id, name, short_name, slug, website, created_at)')
    .order('published_date', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const issues = recordReviewIssues({ title: body.title, content: body.content, sourceUrl: body.notice_url, publishedDate: body.published_date })
  if (issues.length) return NextResponse.json({ error: `Review before publishing: ${issues.join('; ')}.` }, { status: 400 })
  const supabase = createAdminSupabaseClient()
  const slug = body.slug || slugify(body.title) + '-' + Date.now()
  const { data, error } = await supabase.from('notices').insert({ ...body, slug }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
