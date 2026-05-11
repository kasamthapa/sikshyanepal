import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // Check for duplicate
  const { data: existing } = await supabase
    .from('subscribers')
    .select('id, is_active')
    .eq('email', email)
    .single()

  if (existing) {
    if (existing.is_active) {
      return NextResponse.json({ error: 'This email is already subscribed' }, { status: 409 })
    }
    // Re-activate a previously unsubscribed email
    await supabase.from('subscribers').update({ is_active: true }).eq('email', email)
    return NextResponse.json({ success: true, reactivated: true })
  }

  const { error } = await supabase
    .from('subscribers')
    .insert({ email, is_active: true })

  if (error) {
    // Handle race-condition duplicate
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This email is already subscribed' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Could not save your subscription. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
