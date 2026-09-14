import { NextResponse } from 'next/server'
import { isStaff } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!(await isStaff())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!UUID_PATTERN.test(params.id)) return NextResponse.json({ error: 'Media not found.' }, { status: 404 })

  const db = createAdminSupabaseClient()
  const { data: post, error } = await db.from('community_posts').select('media_path').eq('id', params.id).maybeSingle()
  if (error || !post?.media_path) return NextResponse.json({ error: 'Media not found.' }, { status: 404 })

  const { data: signed, error: signedError } = await db.storage.from('community-media').createSignedUrl(post.media_path, 300)
  if (signedError || !signed?.signedUrl) {
    console.error('[admin-community-media:sign]', signedError)
    return NextResponse.json({ error: 'Media is temporarily unavailable.' }, { status: 503 })
  }
  return NextResponse.redirect(signed.signedUrl, { headers: { 'Cache-Control': 'private, no-store' } })
}
