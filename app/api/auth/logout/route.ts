import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/auth'

export async function POST() {
  const { error } = await createAuthClient().auth.signOut()
  if (error) return NextResponse.json({ error: 'Could not sign out. Please try again.' }, { status: 500 })
  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'private, no-store' } })
}
