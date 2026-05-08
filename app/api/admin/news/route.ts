import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import { cookies } from 'next/headers'

function isAuthed() {
  return cookies().get('admin_session')?.value === 'authenticated'
}

export async function GET() {
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase.from('news').select('*').order('published_date', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const supabase = createAdminSupabaseClient()
  const slug = body.slug || slugify(body.title) + '-' + Date.now()
  const { data, error } = await supabase.from('news').insert({ ...body, slug }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
