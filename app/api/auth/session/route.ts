import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await createAuthClient().auth.getUser()
  if (error || !data.user) return NextResponse.json({ authenticated: false }, { headers: { 'Cache-Control': 'private, no-store' } })
  return NextResponse.json({ authenticated: true, email: data.user.email || null }, { headers: { 'Cache-Control': 'private, no-store' } })
}
