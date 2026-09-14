import { createHash } from 'crypto'

type AdminClient = ReturnType<typeof import('@/lib/supabase').createAdminSupabaseClient>
export type PublicFormAction = 'subscribe' | 'correction' | 'college_submission' | 'school_submission'

function fingerprint(request: Request) {
  const salt = process.env.COMMUNITY_HASH_SALT
  if (!salt || salt.length < 32) throw new Error('Request fingerprint secret is not configured')
  const address = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const agent = request.headers.get('user-agent') || 'unknown'
  return createHash('sha256').update(`${salt}:${address}:${agent}`).digest('hex')
}

export async function checkPublicFormRateLimit(db: AdminClient, request: Request, action: PublicFormAction, limit: number) {
  try {
    const { data, error } = await db.rpc('consume_public_form_rate_limit', {
      p_action: action,
      p_fingerprint_hash: fingerprint(request),
      p_limit: limit,
    })
    if (error) {
      // Keep validated forms available during a code-first deployment. The
      // admin System Status page exposes the missing migration immediately.
      if (error.code === 'PGRST202' || error.code === '42883') return 'not_configured' as const
      console.error('[public-form-rate-limit]', error)
      return 'unavailable' as const
    }
    return data ? 'allowed' as const : 'limited' as const
  } catch (error) {
    console.error('[public-form-rate-limit]', error)
    return 'unavailable' as const
  }
}
