import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

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

  // Use service-role client so RLS doesn't block inserts
  const supabase = createAdminSupabaseClient()

  // Check for duplicate
  const { data: existing, error: selectError } = await supabase
    .from('subscribers')
    .select('id, is_active')
    .eq('email', email)
    .maybeSingle()

  if (selectError) {
    console.error('[subscribe] select error:', selectError)
    return NextResponse.json({ error: 'Could not save your subscription. Please try again.' }, { status: 500 })
  }

  if (existing) {
    if (existing.is_active) {
      return NextResponse.json({ error: 'This email is already subscribed' }, { status: 409 })
    }
    // Re-activate a previously unsubscribed email
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ is_active: true })
      .eq('email', email)
    if (updateError) {
      console.error('[subscribe] reactivate error:', updateError)
      return NextResponse.json({ error: 'Could not save your subscription. Please try again.' }, { status: 500 })
    }
    return NextResponse.json({ success: true, reactivated: true })
  }

  const { error: insertError } = await supabase
    .from('subscribers')
    .insert({ email, is_active: true })

  if (insertError) {
    console.error('[subscribe] insert error:', insertError)
    // Handle race-condition duplicate
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'This email is already subscribed' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Could not save your subscription. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
