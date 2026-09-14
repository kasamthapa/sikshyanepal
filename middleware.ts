import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Browser-originated writes must come from this site. API endpoints used by
  // server-side jobs have their own secret authentication and no browser origin.
  const mutatingMethod = !['GET', 'HEAD', 'OPTIONS'].includes(request.method)
  const origin = request.headers.get('origin')
  if (mutatingMethod && pathname.startsWith('/api/') && pathname !== '/api/notify-subscribers' && origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Cross-site request blocked.' }, { status: 403 })
  }

  // Vercel already redirects its domains to TLS. Keep this guard for custom
  // domains and reverse proxies so a production request can never stay on HTTP.
  const forwardedProtocol = request.headers.get('x-forwarded-proto')
  const isLocalHost = ['localhost', '127.0.0.1', '[::1]'].includes(request.nextUrl.hostname)
  if (process.env.NODE_ENV === 'production' && !isLocalHost && forwardedProtocol && forwardedProtocol !== 'https') {
    const secureUrl = request.nextUrl.clone()
    secureUrl.protocol = 'https:'
    return NextResponse.redirect(secureUrl, 308)
  }

  if ((pathname.startsWith('/admin') && pathname !== '/admin/login') || pathname.startsWith('/account/claim')) {
    let response = NextResponse.next({ request })
    const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder', { cookies: { getAll: () => request.cookies.getAll(), setAll: values => { values.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) } } })
    const { data: { user } } = await client.auth.getUser()
    let allowed = Boolean(user)
    if (allowed && pathname.startsWith('/admin')) {
      const { data: profile } = await client.from('profiles').select('role,status').eq('id', user!.id).single()
      const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
      allowed = Boolean(adminEmail && user?.email?.trim().toLowerCase() === adminEmail && profile?.status === 'active' && profile.role === 'owner')
    }
    if (!allowed) {
      return NextResponse.redirect(new URL(pathname.startsWith('/admin') ? '/admin/login' : '/account/login', request.url))
    }
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
