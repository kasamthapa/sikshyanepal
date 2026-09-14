import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { Resend } from 'resend'
import { checkPublicFormRateLimit } from '@/lib/public-form-security'

const resend    = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM      = 'SikshyaNepal <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sikshyanepal.vercel.app').replace(/\/+$/, '')

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function escapeHtml(value: unknown) {
  return clean(value, 3_000).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character] || character))
}

function validHttpUrl(value: string) {
  try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:' } catch { return false }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 200)
}

function inferEducationLevels(programs: string[]): string[] {
  const text = programs.join(' ').toLowerCase()
  const levels = new Set<string>()
  if (text.includes('+2')) levels.add('plus_two')
  if (/\b(bca|bba|mbbs|bsc|bim|bhm|bbs|be|bpharm|bnurs|bachelor)\b/.test(text)) levels.add('bachelor')
  if (/\b(mba|master|msc|ma|med)\b/.test(text)) levels.add('master')
  return Array.from(levels)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 })
    const name = clean(body.name, 220)
    const affiliation = clean(body.affiliation, 120)
    const location = clean(body.location, 160)
    const submitterName = clean(body.submitter_name, 120)
    const submitterRole = clean(body.submitter_role, 80)
    const submitterContact = clean(body.submitter_contact, 254)
    const programs = Array.isArray(body.programs) ? body.programs.map((item: unknown) => clean(item, 100)).filter(Boolean).slice(0, 20) : []
    const website = clean(body.website, 500)

    // ── Validate required fields ───────────────────────────────────────
    if (!name || !affiliation || !location || !submitterName || !submitterRole || !submitterContact) return NextResponse.json({ error: 'Complete every required field.' }, { status: 400 })
    if (!programs.length) {
      return NextResponse.json({ error: 'At least one program is required' }, { status: 400 })
    }
    if (website && !validHttpUrl(website)) return NextResponse.json({ error: 'Official website must start with http:// or https://.' }, { status: 400 })

    const supabase = createAdminSupabaseClient()
    const rate = await checkPublicFormRateLimit(supabase, request, 'college_submission', 3)
    if (rate === 'unavailable') return NextResponse.json({ error: 'College submissions are temporarily unavailable. Please try again later.' }, { status: 503 })
    if (rate === 'limited') return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429, headers: { 'Retry-After': '3600' } })

    // ── Duplicate check ────────────────────────────────────────────────
    const { data: existing } = await supabase
      .from('colleges')
      .select('id')
      .ilike('name', name)
      .limit(1)

    if (existing?.length) {
      return NextResponse.json(
        { error: 'A college with this name already exists in our database.' },
        { status: 409 },
      )
    }

    // ── Generate unique slug ───────────────────────────────────────────
    const baseSlug = slugify(name)
    const affShort = affiliation.split(/\s+/)[0].toLowerCase().slice(0, 3)
    const slug     = `${baseSlug}-${affShort}`

    // ── Insert ─────────────────────────────────────────────────────────
    const { data: college, error } = await supabase
      .from('colleges')
      .insert({
        name,
        slug,
        location,
        address:           clean(body.address, 300) || null,
        phone:             clean(body.phone, 80) || null,
        email:             clean(body.email, 254).toLowerCase() || null,
        website:           website || null,
        description:       clean(body.description, 3_000) || null,
        affiliation,
        programs_offered:  programs.join(', '),
        education_levels:  inferEducationLevels(programs),
        is_featured:       false,
        status:            'pending_review',
        source:            'public_submission',
        submitted_by:      submitterName,
        submitter_role:    submitterRole,
        submitter_contact: submitterContact,
      })
      .select()
      .single()

    if (error) {
      console.error('[submit-college] insert error:', error)
      return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 })
    }

    // ── Notify admin via email ─────────────────────────────────────────
    if (resend && ADMIN_EMAIL) {
      await resend.emails.send({
        from:    FROM,
        to:      ADMIN_EMAIL,
        subject: `[SikshyaNepal] New college submission: ${name.replace(/[\r\n]/g, ' ')}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#1847c4;margin:0 0 16px;">New College Submission</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px 0;color:#6b7280;width:140px;">College Name</td>
                  <td style="padding:8px 0;font-weight:600;">${escapeHtml(name)}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Affiliation</td>
                  <td style="padding:8px 0;">${escapeHtml(affiliation)}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Location</td>
                  <td style="padding:8px 0;">${escapeHtml(location)}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Programs</td>
                  <td style="padding:8px 0;">${escapeHtml(programs.join(', ') || '—')}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Website</td>
                  <td style="padding:8px 0;">${escapeHtml(website || '—')}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Phone</td>
                  <td style="padding:8px 0;">${escapeHtml(clean(body.phone, 80) || '—')}</td></tr>
              <tr style="border-top:1px solid #e5e7eb;">
                  <td style="padding:12px 0 8px;color:#6b7280;">Submitted by</td>
                  <td style="padding:12px 0 8px;font-weight:600;">${escapeHtml(submitterName)} (${escapeHtml(submitterRole)})</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Contact</td>
                  <td style="padding:8px 0;">${escapeHtml(submitterContact)}</td></tr>
              ${clean(body.description, 3_000) ? `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Description</td>
                  <td style="padding:8px 0;">${escapeHtml(body.description)}</td></tr>` : ''}
            </table>
            <div style="margin-top:24px;">
              <a href="${SITE_URL}/admin/colleges/pending"
                 style="display:inline-block;padding:10px 20px;background:#1847c4;color:#fff;
                        font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
                Review in Admin Panel
              </a>
            </div>
          </div>
        `,
      }).catch((e) => console.warn('[submit-college] email failed:', e))
    }

    return NextResponse.json({ success: true, id: college.id })
  } catch (e) {
    console.error('[submit-college] unexpected error:', e)
    return NextResponse.json({ error: 'Unexpected error. Please try again.' }, { status: 500 })
  }
}
