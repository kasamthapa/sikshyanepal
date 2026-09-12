import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isStaff())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createAdminSupabaseClient()
  const [{ data: posts, error: postError }, { data: comments, error: commentError }, { data: reports, error: reportError }] = await Promise.all([
    db.from('community_posts').select('id,title,body,topic,status,created_at,moderation_note,media_url,media_type,author_id,public_alias').in('status', ['pending', 'hidden']).order('created_at', { ascending: false }).limit(100),
    db.from('community_comments').select('id,post_id,body,status,created_at,moderation_note,author_id,public_alias,post:community_posts(title)').in('status', ['pending', 'hidden']).order('created_at', { ascending: false }).limit(100),
    db.from('community_reports').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(100),
  ])
  if (postError || commentError || reportError) return NextResponse.json({ error: postError?.message || commentError?.message || reportError?.message }, { status: 500 })
  const authorIds = Array.from(new Set([...(posts || []), ...(comments || [])].map(item => item.author_id).filter(Boolean))) as string[]
  const identities = Object.fromEntries(await Promise.all(authorIds.map(async id => {
    const { data } = await db.auth.admin.getUserById(id)
    return [id, { email: data.user?.email || 'Unavailable', provider: data.user?.app_metadata?.provider || 'unknown' }]
  })))
  return NextResponse.json({ posts: posts || [], comments: comments || [], reports: reports || [], identities }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PATCH(request: Request) {
  if (!(await isStaff())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const type = body.type
  const id = typeof body.id === 'string' ? body.id : ''
  const status = body.status
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Invalid item.' }, { status: 400 })
  const db = createAdminSupabaseClient()
  if (type === 'account') {
    if (!['suspended', 'banned', 'active'].includes(status)) return NextResponse.json({ error: 'Invalid account decision.' }, { status: 400 })
    const { error } = await db.from('community_profiles').update({ status, updated_at: new Date().toISOString() }).eq('user_id', id)
    if (error) { console.error('[admin/community:account]', error); return NextResponse.json({ error: 'The account decision could not be saved.' }, { status: 500 }) }
    await writeAudit(`community.account.${status}`, 'community_profile', id)
    return NextResponse.json({ success: true })
  }
  if (type === 'report') {
    if (!['resolved', 'dismissed', 'hide-target'].includes(status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
    if (status === 'hide-target') {
      const { data: report } = await db.from('community_reports').select('target_type,target_id').eq('id', id).single()
      if (!report) return NextResponse.json({ error: 'Report not found.' }, { status: 404 })
      const table = report.target_type === 'post' ? 'community_posts' : 'community_comments'
      const { error: hideError } = await db.from(table).update({ status: 'hidden', updated_at: new Date().toISOString() }).eq('id', report.target_id)
      if (hideError) { console.error('[admin/community:hide-report-target]', hideError); return NextResponse.json({ error: 'The reported content could not be hidden.' }, { status: 500 }) }
      await writeAudit('community.report.hide_target', report.target_type, report.target_id, { report_id: id })
    }
    const resolvedStatus = status === 'hide-target' ? 'resolved' : status
    const { error } = await db.from('community_reports').update({ status: resolvedStatus, resolved_at: new Date().toISOString() }).eq('id', id)
    if (error) { console.error('[admin/community:report]', error); return NextResponse.json({ error: 'The report decision could not be saved.' }, { status: 500 }) }
    await writeAudit(`community.report.${resolvedStatus}`, 'community_report', id)
  } else {
    if (!['post', 'comment'].includes(type) || !['published', 'rejected', 'hidden'].includes(status)) return NextResponse.json({ error: 'Invalid decision.' }, { status: 400 })
    const table = type === 'post' ? 'community_posts' : 'community_comments'
    const update = { status, published_at: status === 'published' ? new Date().toISOString() : null, moderation_note: typeof body.note === 'string' ? body.note.slice(0, 500) : null, updated_at: new Date().toISOString() }
    const { error } = await db.from(table).update(update).eq('id', id)
    if (error) { console.error('[admin/community:moderate]', error); return NextResponse.json({ error: 'The moderation decision could not be saved.' }, { status: 500 }) }
    await writeAudit(`community.${type}.${status}`, type, id, { note_provided: Boolean(update.moderation_note) })
  }
  revalidatePath('/community')
  revalidatePath('/community/[id]', 'page')
  return NextResponse.json({ success: true })
}
