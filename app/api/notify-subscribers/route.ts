import { NextRequest, NextResponse } from 'next/server'
import { sendResultNotification, type ResultNotification } from '@/lib/email'

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

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid notification request.' }, { status: 400 })
    }
    const payload = body as Record<string, unknown>

    // Validate secret
    const secret = process.env.NOTIFICATION_SECRET
    if (!secret || payload.secret !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = normalizeResults(payload.results)
    if (!results.length) {
      return NextResponse.json({ error: 'No valid results provided' }, { status: 400 })
    }

    const { sent, errors } = await sendResultNotification(results)
    return NextResponse.json({ sent, errors })
  } catch (e) {
    console.error('[notify-subscribers]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
