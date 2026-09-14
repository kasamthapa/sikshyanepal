import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { checkPublicFormRateLimit } from '@/lib/public-form-security'

const TYPES = new Set(['incorrect_information', 'contact_update', 'program_update', 'closed_or_moved', 'claim_profile', 'other'])

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (clean(body.website, 100)) return NextResponse.json({ success: true })

    const entityType = clean(body.entity_type, 20)
    const entityId = clean(body.entity_id, 50)
    const entityName = clean(body.entity_name, 200)
    const correctionType = clean(body.correction_type, 40)
    const details = clean(body.details, 4000)
    const email = clean(body.reporter_email, 254).toLowerCase()
    const sourceUrl = clean(body.source_url, 1000)

    if (!['school', 'college'].includes(entityType) || !/^[0-9a-f-]{36}$/i.test(entityId)) {
      return NextResponse.json({ error: 'Invalid institution.' }, { status: 400 })
    }
    if (!entityName || !TYPES.has(correctionType) || details.length < 10) {
      return NextResponse.json({ error: 'Please provide at least 10 characters describing the correction.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    }
    if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) {
      return NextResponse.json({ error: 'Supporting source must be a valid web address.' }, { status: 400 })
    }

    const supabase = createAdminSupabaseClient()
    const rate = await checkPublicFormRateLimit(supabase, request, 'correction', 3)
    if (rate === 'unavailable') return NextResponse.json({ error: 'Corrections are temporarily unavailable. Please try again later.' }, { status: 503 })
    if (rate === 'limited') return NextResponse.json({ error: 'Too many correction reports. Please try again later.' }, { status: 429, headers: { 'Retry-After': '3600' } })
    const { error } = await supabase.from('data_corrections').insert({
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      correction_type: correctionType,
      details,
      source_url: sourceUrl || null,
      reporter_name: clean(body.reporter_name, 120) || null,
      reporter_email: email,
      reporter_role: clean(body.reporter_role, 40) || null,
      status: 'pending',
    })
    if (error) {
      console.error('[report-correction]', error)
      return NextResponse.json({ error: 'Could not save this report. Please try again.' }, { status: 500 })
    }
    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
