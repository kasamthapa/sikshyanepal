import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/auth'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/account/login?error=google_callback_failed', url.origin))
  }

  const { error } = await createAuthClient().auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL('/account/login?error=google_sign_in_failed', url.origin))
  }

  return NextResponse.redirect(new URL('/', url.origin))
}
