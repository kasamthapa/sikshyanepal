import { createHash } from 'crypto'

export function requestFingerprint(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const agent = request.headers.get('user-agent') || 'unknown'
  const salt = process.env.COMMUNITY_HASH_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!salt) throw new Error('Community fingerprint secret is not configured')
  return createHash('sha256').update(`${salt}:${forwarded}:${agent}`).digest('hex')
}

export function containsPersonalContact(text: string) {
  const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
  const phone = /(?:\+?977[-\s]?)?(?:9[678]\d[-\s]?\d{7}|0?1[-\s]?\d{7})/
  const socialHandle = /(?:^|\s)@[a-z0-9_.]{3,30}\b/i
  const preciseLocation = /\b(?:room|house|flat|hostel room)\s*(?:no\.?|number|#)?\s*[a-z0-9-]{1,10}\b/i
  return email.test(text) || phone.test(text) || socialHandle.test(text) || preciseLocation.test(text)
}

export function cleanCommunityText(value: unknown) {
  return typeof value === 'string' ? value.replace(/\0/g, '').replace(/\r\n/g, '\n').trim() : ''
}

export function cleanPublicAlias(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function validPublicAlias(alias: string) {
  return /^[A-Za-z0-9_]{3,24}$/.test(alias)
}

export function hasValidCommunityMediaSignature(type: string, bytes: Uint8Array) {
  const startsWith = (...signature: number[]) => signature.every((value, index) => bytes[index] === value)
  if (type === 'image/jpeg') return startsWith(0xff, 0xd8, 0xff)
  if (type === 'image/png') return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
  if (type === 'image/gif') return startsWith(0x47, 0x49, 0x46, 0x38)
  if (type === 'image/webp') return startsWith(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  if (type === 'video/mp4') return bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70
  if (type === 'video/webm') return startsWith(0x1a, 0x45, 0xdf, 0xa3)
  return false
}

export async function recordCommunitySecurityEvent(
  db: ReturnType<typeof import('@/lib/supabase').createAdminSupabaseClient>,
  values: { userId: string; action: 'post' | 'comment' | 'report' | 'vote' | 'delete' | 'appeal'; fingerprint: string; targetId?: string },
) {
  const { error } = await db.from('community_security_events').insert({
    user_id: values.userId,
    action: values.action,
    target_id: values.targetId || null,
    fingerprint_hash: values.fingerprint,
  })
  if (error) console.error('[community-security:event]', error)
}

export async function checkCommunityRateLimit(
  db: ReturnType<typeof import('@/lib/supabase').createAdminSupabaseClient>,
  values: {
    table: 'community_posts' | 'community_comments' | 'community_reports'
    userColumn: 'author_id' | 'reporter_id'
    userId: string
    fingerprint: string
    accountLimit: number
    deviceLimit: number
  },
) {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const [accountResult, deviceResult] = await Promise.all([
    db.from(values.table).select('id', { count: 'exact', head: true }).eq(values.userColumn, values.userId).gte('created_at', since),
    db.from(values.table).select('id', { count: 'exact', head: true }).eq('fingerprint_hash', values.fingerprint).gte('created_at', since),
  ])
  if (accountResult.error || deviceResult.error) {
    console.error('[community-security:rate-limit]', accountResult.error || deviceResult.error)
    return 'unavailable' as const
  }
  if ((accountResult.count || 0) >= values.accountLimit || (deviceResult.count || 0) >= values.deviceLimit) return 'limited' as const
  return 'allowed' as const
}
