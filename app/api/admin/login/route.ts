import { NextResponse } from 'next/server'
import { validatePassword } from '@/lib/admin-auth'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (!validatePassword(password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return response
}
