import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { checkCommunityRateLimit, cleanCommunityText, requestFingerprint } from '@/lib/community-server'
import { getAuthContext, isGoogleAccount } from '@/lib/auth'
import { recordCommunitySecurityEvent } from '@/lib/community-server'

const REASONS = ['personal-information', 'bullying', 'spam', 'unsafe-advice', 'false-information', 'other']
export async function POST(request: Request) {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in before reporting content.' }, { status: 401 })
  if (!isGoogleAccount(auth.user)) return NextResponse.json({ error: 'Community reports require a Google-verified account.' }, { status: 403 })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Reporting is temporarily unavailable.' }, { status: 503 })
  const body = await request.json().catch(() => ({}))
  const targetType = cleanCommunityText(body.target_type)
  const targetId = cleanCommunityText(body.target_id)
  const reason = cleanCommunityText(body.reason)
  const details = cleanCommunityText(body.details).slice(0, 500) || null
  if (!['post', 'comment'].includes(targetType) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetId) || !REASONS.includes(reason)) return NextResponse.json({ error: 'Invalid report.' }, { status: 400 })
  const db = createAdminSupabaseClient()
  const fingerprint = requestFingerprint(request)
  const targetTable = targetType === 'post' ? 'community_posts' : 'community_comments'
  const { data: target, error: targetError } = await db.from(targetTable).select('id').eq('id', targetId).eq('status', 'published').maybeSingle()
  if (targetError) { console.error('[community-report:target]', targetError); return NextResponse.json({ error: 'This content could not be checked.' }, { status: 503 }) }
  if (!target) return NextResponse.json({ error: 'The content is no longer available to report.' }, { status: 404 })
  const { data: existingReport, error: existingError } = await db.from('community_reports').select('id').eq('reporter_id', auth.user.id).eq('target_type', targetType).eq('target_id', targetId).eq('status', 'open').maybeSingle()
  if (existingError) { console.error('[community-report:duplicate]', existingError); return NextResponse.json({ error: 'Reporting is temporarily unavailable while safety checks recover.' }, { status: 503 }) }
  if (existingReport) return NextResponse.json({ error: 'You have already reported this content. The moderation team will review it.' }, { status: 409 })
  const rate = await checkCommunityRateLimit(db, { table: 'community_reports', userColumn: 'reporter_id', userId: auth.user.id, fingerprint, accountLimit: 10, deviceLimit: 20 })
  if (rate === 'unavailable') return NextResponse.json({ error: 'Reporting is temporarily unavailable while safety checks recover.' }, { status: 503 })
  if (rate === 'limited') return NextResponse.json({ error: 'You have reached the hourly reporting limit.' }, { status: 429 })
  const { data, error } = await db.from('community_reports').insert({ target_type: targetType, target_id: targetId, reason, details, fingerprint_hash: fingerprint, reporter_id: auth.user.id }).select('id').single()
  if (error?.code === '23505') return NextResponse.json({ error: 'You have already reported this content. The moderation team will review it.' }, { status: 409 })
  if (error) return NextResponse.json({ error: 'Could not save this report.' }, { status: 500 })
  await recordCommunitySecurityEvent(db, { userId: auth.user.id, action: 'report', fingerprint, targetId: data.id })
  return NextResponse.json({ success: true }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } })
}
