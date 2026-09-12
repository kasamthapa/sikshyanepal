import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { checkCommunityRateLimit, cleanCommunityText, containsPersonalContact, requestFingerprint } from '@/lib/community-server'
import { getAuthContext, isGoogleAccount } from '@/lib/auth'
import { recordCommunitySecurityEvent } from '@/lib/community-server'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in with Google before replying.' }, { status: 401 })
  if (!isGoogleAccount(auth.user)) return NextResponse.json({ error: 'Community replies require a Google-verified account.' }, { status: 403 })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Community replies are temporarily unavailable.' }, { status: 503 })
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(params.id)) return NextResponse.json({ error: 'Invalid discussion.' }, { status: 400 })
  const body = await request.json().catch(() => ({}))
  if (body.website) return NextResponse.json({ success: true }, { status: 202 })
  const content = cleanCommunityText(body.body)
  if (content.length < 2 || content.length > 1000) return NextResponse.json({ error: 'Replies must be between 2 and 1,000 characters.' }, { status: 400 })
  if (containsPersonalContact(content)) return NextResponse.json({ error: 'For safety, remove phone numbers and email addresses.' }, { status: 400 })
  const fingerprint = requestFingerprint(request)
  const db = createAdminSupabaseClient()
  const { data: communityProfile } = await db.from('community_profiles').select('public_alias,status').eq('user_id', auth.user.id).maybeSingle()
  if (!communityProfile?.public_alias) return NextResponse.json({ error: 'Choose your public community name before replying.' }, { status: 409 })
  if (communityProfile.status !== 'active') return NextResponse.json({ error: 'This community account is restricted.' }, { status: 403 })
  const { data: post } = await db.from('community_posts').select('id').eq('id', params.id).eq('status', 'published').single()
  if (!post) return NextResponse.json({ error: 'Discussion not found.' }, { status: 404 })
  const rate = await checkCommunityRateLimit(db, { table: 'community_comments', userColumn: 'author_id', userId: auth.user.id, fingerprint, accountLimit: 8, deviceLimit: 16 })
  if (rate === 'unavailable') return NextResponse.json({ error: 'Replies are temporarily unavailable while safety checks recover.' }, { status: 503 })
  if (rate === 'limited') return NextResponse.json({ error: 'You have reached the hourly reply limit. Please try later.' }, { status: 429 })
  const { data, error } = await db.from('community_comments').insert({ post_id: params.id, body: content, fingerprint_hash: fingerprint, author_id: auth.user.id, public_alias: communityProfile.public_alias }).select('id').single()
  if (error) return NextResponse.json({ error: 'Could not save this reply.' }, { status: 500 })
  await recordCommunitySecurityEvent(db, { userId: auth.user.id, action: 'comment', fingerprint, targetId: data.id })
  return NextResponse.json({ success: true }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } })
}
