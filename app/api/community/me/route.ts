import { NextResponse } from 'next/server'
import { getAuthContext, isGoogleAccount } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { cleanPublicAlias, validPublicAlias } from '@/lib/community-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ authenticated: false }, { headers: { 'Cache-Control': 'no-store' } })
  const { data, error } = await createAdminSupabaseClient().from('community_profiles').select('public_alias,status').eq('user_id', auth.user.id).maybeSingle()
  if (error) { console.error('[community-profile:get]', error); return NextResponse.json({ error: 'Your community profile could not be loaded.' }, { status: 503, headers: { 'Cache-Control': 'private, no-store' } }) }
  return NextResponse.json({ authenticated: isGoogleAccount(auth.user), alias: data?.public_alias || null, status: data?.status || 'active', requiresGoogle: !isGoogleAccount(auth.user) }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(request: Request) {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in to choose a community name.' }, { status: 401 })
  if (!isGoogleAccount(auth.user)) return NextResponse.json({ error: 'Use Google sign-in for the student community.' }, { status: 403 })
  const body = await request.json().catch(() => ({}))
  const alias = cleanPublicAlias(body.alias)
  if (!validPublicAlias(alias)) return NextResponse.json({ error: 'Use 3–24 letters, numbers or underscores.' }, { status: 400 })
  const reserved = /^(admin|administrator|moderator|sikshyanepal|staff|official|support|owner)$/i
  if (reserved.test(alias)) return NextResponse.json({ error: 'That name is reserved. Choose another.' }, { status: 400 })
  const db = createAdminSupabaseClient()
  const { data: existing } = await db.from('community_profiles').select('created_at,public_alias,status').eq('user_id', auth.user.id).maybeSingle()
  if (existing?.status && existing.status !== 'active') return NextResponse.json({ error: 'This community account is restricted.' }, { status: 403 })
  // Prevent identity hopping: an established alias can only be changed by support.
  if (existing?.public_alias && existing.public_alias.toLowerCase() !== alias.toLowerCase()) {
    return NextResponse.json({ error: 'Your public name is already set. Contact support to request a change.' }, { status: 409 })
  }
  const { error } = await db.from('community_profiles').upsert({ user_id: auth.user.id, public_alias: alias, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) return NextResponse.json({ error: error.code === '23505' ? 'That public name is already taken.' : 'Could not save your public name.' }, { status: 400 })
  return NextResponse.json({ authenticated: true, alias })
}
