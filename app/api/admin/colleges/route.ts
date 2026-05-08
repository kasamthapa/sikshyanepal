import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import { cookies } from 'next/headers'

function isAuthed() {
  const cookieStore = cookies()
  return cookieStore.get('admin_session')?.value === 'authenticated'
}

export async function GET() {
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('colleges')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const supabase = createAdminSupabaseClient()
  const slug = body.slug || slugify(body.name)
  const { data, error } = await supabase
    .from('colleges')
    .insert({ ...body, slug })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
