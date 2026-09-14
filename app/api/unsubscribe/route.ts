import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  if (!email || !token) {
    return new NextResponse(errorPage('Invalid unsubscribe link.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const supabase = createAdminSupabaseClient()

  const normalizedEmail = email.trim().toLowerCase()
  const { data, error } = await supabase
    .from('subscribers')
    .update({ is_active: false })
    .eq('email', normalizedEmail)
    .eq('token', token)
    .select('id')

  if (error || !data?.length) {
    if (error) console.error('[unsubscribe]', error.message)
    return new NextResponse(errorPage('This unsubscribe link is invalid or has expired.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  return new NextResponse(successPage(), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function successPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unsubscribed — SikshyaNepal</title>
  <style>
    body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
           background:#f0f4ff; display:flex; align-items:center; justify-content:center;
           min-height:100vh; }
    .card { background:#fff; border-radius:16px; border:1px solid #e5e7eb;
            padding:40px; max-width:440px; text-align:center; }
    .icon { width:48px; height:48px; background:#f0fdf4; border-radius:50%;
            display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:24px; }
    h1 { margin:0 0 8px; font-size:20px; font-weight:700; color:#0f1629; }
    p  { margin:0 0 24px; font-size:14px; color:#6b7280; line-height:1.6; }
    a  { display:inline-block; padding:10px 24px; background:#1847c4; color:#fff;
         font-size:14px; font-weight:600; text-decoration:none; border-radius:8px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h1>You have been unsubscribed</h1>
    <p>
      Your address has been removed from SikshyaNepal result alerts.
      You won&apos;t receive any more notifications at this address.
    </p>
    <a href="https://sikshyanepal.vercel.app">Return to SikshyaNepal</a>
  </div>
</body>
</html>`
}

function errorPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Error — SikshyaNepal</title>
  <style>
    body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
           background:#f0f4ff; display:flex; align-items:center; justify-content:center;
           min-height:100vh; }
    .card { background:#fff; border-radius:16px; border:1px solid #e5e7eb;
            padding:40px; max-width:440px; text-align:center; }
    h1 { margin:0 0 8px; font-size:20px; font-weight:700; color:#0f1629; }
    p  { margin:0; font-size:14px; color:#6b7280; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Oops</h1>
    <p>${message}</p>
  </div>
</body>
</html>`
}
