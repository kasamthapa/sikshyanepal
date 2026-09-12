import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase'

export type UserRole = 'user' | 'representative' | 'reviewer' | 'editor' | 'owner'
export const STAFF_ROLES: UserRole[] = ['reviewer', 'editor', 'owner']

export function isAdminEmail(email: string | null | undefined) {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  return Boolean(configuredEmail && email?.trim().toLowerCase() === configuredEmail)
}

export function createAuthClient() {
  const store = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder', {
    cookies: { getAll: () => store.getAll(), setAll: (values) => { try { values.forEach(({ name, value, options }) => store.set(name, value, options)) } catch {} } },
  })
}

export async function getAuthContext() {
  const { data: { user } } = await createAuthClient().auth.getUser()
  if (!user) return null
  const { data: profile } = await createAdminSupabaseClient().from('profiles').select('role,status,full_name').eq('id', user.id).single()
  if (!profile || profile.status !== 'active') return null
  return { user, profile: profile as { role: UserRole; status: string; full_name: string | null } }
}

export function isGoogleAccount(user: { app_metadata?: Record<string, unknown> }) {
  const provider = user.app_metadata?.provider
  const providers = user.app_metadata?.providers
  return provider === 'google' || (Array.isArray(providers) && providers.includes('google'))
}

export async function isStaff(roles: UserRole[] = STAFF_ROLES) {
  const auth = await getAuthContext()
  return Boolean(auth && isAdminEmail(auth.user.email) && auth.profile.role === 'owner' && roles.includes(auth.profile.role))
}

export async function writeAudit(action: string, entityType: string, entityId?: string, metadata: Record<string, unknown> = {}) {
  const auth = await getAuthContext(); if (!auth) return
  const { error } = await createAdminSupabaseClient().from('audit_logs').insert({ actor_id: auth.user.id, action, entity_type: entityType, entity_id: entityId || null, metadata })
  if (error) console.error('[audit-log:write]', { action, entityType, entityId, error })
}
