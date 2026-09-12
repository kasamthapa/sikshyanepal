import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isStaff } from '@/lib/auth'
import { editorialQualityError } from '@/lib/editorial-quality'

const isAuthed = isStaff

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 240) : ''
  const content = typeof body.content === 'string' ? body.content.trim().slice(0, 50000) : ''
  const sourceName = typeof body.source_name === 'string' ? body.source_name.trim().slice(0, 240) : ''
  const sourceUrl = typeof body.source_url === 'string' ? body.source_url.trim().slice(0, 1000) : ''
  const status = ['draft', 'published', 'archived'].includes(body.status) ? body.status : 'draft'
  if (!title || !content) return NextResponse.json({ error: 'Title and original summary are required.' }, { status: 400 })
  if (status === 'published' && (content.length < 200 || !sourceName || !/^https?:\/\//i.test(sourceUrl))) return NextResponse.json({ error: 'Published news requires an original summary of at least 200 characters and a valid original source.' }, { status: 400 })
  const qualityError = status === 'published' ? editorialQualityError(title, content) : null
  if (qualityError) return NextResponse.json({ error: qualityError }, { status: 400 })
  const supabase = createAdminSupabaseClient()
  const now = new Date().toISOString()
  const row = { title, slug: body.slug?.trim(), content, image_url: body.image_url || null, published_date: body.published_date, author_name: body.author_name?.trim() || 'SikshyaNepal Editorial', source_name: sourceName || null, source_url: sourceUrl || null, status, last_verified_at: status === 'published' ? now : null, updated_at: now }
  const { data, error } = await supabase.from('news').update(row).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminSupabaseClient()
  const { error } = await supabase.from('news').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
