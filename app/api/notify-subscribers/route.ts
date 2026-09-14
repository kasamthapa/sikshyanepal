import { NextRequest, NextResponse } from 'next/server'
import { sendResultNotification, type ResultNotification } from '@/lib/email'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { createHash, timingSafeEqual } from 'crypto'

export const runtime = 'nodejs'

const SLUG_PATTERN = /^[a-z0-9-]{3,160}$/

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function normalizeResults(value: unknown): ResultNotification[] {
  if (!Array.isArray(value)) return []
  return value.slice(0, 25).flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return []
    const row = item as Record<string, unknown>
    const title = text(row.title, 240)
    const slug = text(row.slug, 160)
    if (title.length < 3 || !SLUG_PATTERN.test(slug)) return []
    const university = row.university && typeof row.university === 'object' && !Array.isArray(row.university)
      ? { short_name: text((row.university as Record<string, unknown>).short_name, 100) || null }
      : null
    return [{ title, slug, university }]
  })
}

function safeSecretMatch(expected: string, received: unknown) {
  if (typeof received !== 'string') return false
  const expectedBytes = Buffer.from(expected)
  const receivedBytes = Buffer.from(received)
  return expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes)
}

function eventKey(results: ResultNotification[]) {
  const stable = results.map((result) => `${result.slug}:${result.title}`).sort().join('\n')
  return createHash('sha256').update(`results\n${stable}`).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid notification request.' }, { status: 400 })
    }
    const payload = body as Record<string, unknown>

    // Validate secret
    const secret = process.env.NOTIFICATION_SECRET
    if (!secret || !safeSecretMatch(secret, payload.secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = normalizeResults(payload.results)
    if (!results.length) {
      return NextResponse.json({ error: 'No valid results provided' }, { status: 400 })
    }

    const db = createAdminSupabaseClient()
    const key = eventKey(results)
    const { data: run, error: runError } = await db.from('notification_delivery_runs').insert({
      event_key: key,
      category: 'results',
      item_count: results.length,
    }).select('id').single()

    // Do not interrupt existing result alerts while a code deployment is
    // waiting for its companion database migration. System Status exposes it.
    if (runError?.code === '42P01') {
      const delivery = await sendResultNotification(results)
      return NextResponse.json({ ...delivery, status: delivery.errors ? 'partial' : 'sent', delivery_log: 'migration_pending' })
    }
    if (runError?.code === '23505') {
      const { data: existing } = await db.from('notification_delivery_runs').select('status,sent_count,error_count,recipient_count,started_at').eq('event_key', key).maybeSingle()
      if (existing?.status === 'sent' || existing?.status === 'partial') return NextResponse.json({ sent: existing.sent_count, errors: existing.error_count, recipients: existing.recipient_count, duplicate: true })
      return NextResponse.json({ error: 'This notification batch is already being processed. Do not retry yet.' }, { status: 409, headers: { 'Retry-After': '900' } })
    }
    if (runError || !run) return NextResponse.json({ error: 'Notification delivery could not be recorded. No email was sent.' }, { status: 503 })

    const { sent, errors, recipients } = await sendResultNotification(results)
    const status = errors ? (sent ? 'partial' : 'failed') : 'sent'
    const { error: updateError } = await db.from('notification_delivery_runs').update({ status, recipient_count: recipients, sent_count: sent, error_count: errors, completed_at: new Date().toISOString() }).eq('id', run.id)
    if (updateError) console.error('[notify-subscribers:delivery-log]', updateError)
    return NextResponse.json({ sent, errors, recipients, status })
  } catch (e) {
    console.error('[notify-subscribers]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
