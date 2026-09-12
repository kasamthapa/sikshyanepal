import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { recordCommunitySecurityEvent, requestFingerprint } from '@/lib/community-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createAdminSupabaseClient()
  const [{ data: posts, error: postError }, { data: comments, error: commentError }] = await Promise.all([
    db.from('community_posts').select('id,title,status,created_at,moderation_note').eq('author_id', auth.user.id).order('created_at', { ascending: false }),
    db.from('community_comments').select('id,post_id,body,status,created_at,moderation_note').eq('author_id', auth.user.id).order('created_at', { ascending: false }),
  ])
  if (postError || commentError) { console.error('[community-content:get]', postError || commentError); return NextResponse.json({ error: 'Your community content could not be loaded.' }, { status: 503, headers: { 'Cache-Control': 'private, no-store' } }) }
  return NextResponse.json({ posts: posts || [], comments: comments || [] }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function DELETE(request: Request) {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const type = body.type === 'comment' ? 'comment' : body.type === 'post' ? 'post' : null
  const id = typeof body.id === 'string' ? body.id : ''
  if (!type || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Invalid content.' }, { status: 400 })
  const db = createAdminSupabaseClient()
  const table = type === 'post' ? 'community_posts' : 'community_comments'
  const { data } = await db.from(table).select('id').eq('id', id).eq('author_id', auth.user.id).maybeSingle()
  if (!data) return NextResponse.json({ error: 'Content not found.' }, { status: 404 })
  const { error } = await db.from(table).delete().eq('id', id).eq('author_id', auth.user.id)
  if (error) return NextResponse.json({ error: 'Could not delete this content.' }, { status: 500 })
  await recordCommunitySecurityEvent(db, { userId: auth.user.id, action: 'delete', fingerprint: requestFingerprint(request), targetId: id })
  return NextResponse.json({ success: true })
}
