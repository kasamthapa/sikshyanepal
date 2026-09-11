import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { Resend } from 'resend'
import { collegeDisplayPrograms } from '@/lib/college-display'

const resend      = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM        = 'SikshyaNepal <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || null
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sikshyanepal.vercel.app'

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!)

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>
    try { const parsed: unknown=await request.json();if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error();body=parsed as Record<string,unknown> } catch { return NextResponse.json({error:'Invalid request.'},{status:400}) }
    const collegeId = clean(body.college_id, 80)
    const name = clean(body.name, 100)
    const phone = clean(body.phone, 30).replace(/\s/g, '')
    const email = clean(body.email, 160)
    const program = clean(body.program, 140)
    const message = clean(body.message, 300)
    const consent = body.consent === true

    // Quietly accept automated submissions that fill the hidden field, without storing them.
    if (clean(body.website, 200)) return NextResponse.json({ success: true })

    // ── Validate required fields ───────────────────────────────────────
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!/^(?:9[6-9]\d{8}|\d{2}-?\d{6,7})$/.test(phone)) return NextResponse.json({ error: 'Enter a valid Nepali phone number' }, { status: 400 })
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
    if (!program) return NextResponse.json({ error: 'Program is required' }, { status: 400 })
    if (!collegeId) return NextResponse.json({ error: 'College ID missing' }, { status: 400 })
    if (!consent) return NextResponse.json({ error: 'Consent is required before sending an enquiry' }, { status: 400 })

    const supabase = createAdminSupabaseClient()

    const { data: college, error: collegeError } = await supabase
      .from('colleges')
      .select('id,name,status,programs_offered')
      .eq('id', collegeId)
      .or('status.eq.active,status.is.null')
      .maybeSingle()
    if (collegeError) return NextResponse.json({ error: 'College details could not be checked. Please try again.' }, { status: 503 })
    if (!college) return NextResponse.json({ error: 'This college is not available for enquiries.' }, { status: 404 })
    const collegeName = college.name
    const { data: linkedPrograms, error: programError } = await supabase.from('college_programs').select('program:programs(name)').eq('college_id', college.id).limit(100)
    if (programError) console.warn('[apply] program validation unavailable:', programError.message)
    const offeredPrograms = Array.from(new Set([
      ...((linkedPrograms || []).flatMap(item => item.program && typeof item.program === 'object' && 'name' in item.program ? [String(item.program.name)] : [])),
      ...collegeDisplayPrograms(typeof college.programs_offered === 'string' ? college.programs_offered : null),
    ]))
    if (program !== 'Not sure yet' && offeredPrograms.length > 0 && !offeredPrograms.some(item => item.toLowerCase() === program.toLowerCase())) return NextResponse.json({ error: 'Choose a program currently listed by this college.' }, { status: 400 })

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const today = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const [{ count: recentDuplicate, error: duplicateError }, { count: dailyCount, error: dailyError }] = await Promise.all([
      supabase.from('leads').select('id', { count: 'exact', head: true }).eq('college_id', college.id).eq('student_phone', phone).gte('created_at', fifteenMinutesAgo),
      supabase.from('leads').select('id', { count: 'exact', head: true }).eq('student_phone', phone).gte('created_at', today),
    ])
    if (duplicateError || dailyError) { console.error('[apply] abuse check failed:', duplicateError?.message || dailyError?.message); return NextResponse.json({ error: 'Enquiries are temporarily unavailable. Please contact the college directly.' }, { status: 503 }) }
    if ((recentDuplicate || 0) > 0) return NextResponse.json({ error: 'An enquiry with this phone number was sent to this college recently. Please wait before trying again.' }, { status: 429 })
    if ((dailyCount || 0) >= 5) return NextResponse.json({ error: 'This phone number has reached today’s enquiry limit. Please try again tomorrow.' }, { status: 429 })

    // ── Insert lead ────────────────────────────────────────────────────
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        college_id: college.id,
        college_name: collegeName,
        student_name: name,
        student_email: email || null,
        student_phone: phone,
        program_interest: program,
        message: message || null,
        status:        'new',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[apply] insert error:', error)
      return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 })
    }

    // ── Notify admin ───────────────────────────────────────────────────
    if (resend && ADMIN_EMAIL) {
      await resend.emails.send({
        from:    FROM,
        to:      ADMIN_EMAIL,
        subject: `New admission enquiry — ${collegeName}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#1847c4;margin:0 0 4px;">New admission enquiry</h2>
            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">A student requested admission information through SikshyaNepal.</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#6b7280;width:140px;">College</td>
                <td style="padding:10px 0;font-weight:600;">${escapeHtml(collegeName)}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#6b7280;">Student Name</td>
                <td style="padding:10px 0;font-weight:600;">${escapeHtml(name)}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#6b7280;">Phone</td>
                <td style="padding:10px 0;font-weight:600;color:#1847c4;">${escapeHtml(phone)}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#6b7280;">Email</td>
                <td style="padding:10px 0;">${email ? escapeHtml(email) : '—'}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#6b7280;">Program</td>
                <td style="padding:10px 0;">${escapeHtml(program)}</td>
              </tr>
              ${message ? `<tr>
                <td style="padding:10px 0;color:#6b7280;vertical-align:top;">Message</td>
                <td style="padding:10px 0;">${escapeHtml(message)}</td>
              </tr>` : ''}
            </table>
            <div style="margin-top:24px;">
              <a href="${SITE_URL}/admin/leads"
                 style="display:inline-block;padding:10px 20px;background:#1847c4;color:#fff;
                        font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
                Review in Admin Panel
              </a>
            </div>
          </div>
        `,
      }).catch(e => console.warn('[apply] admin email failed:', e))
    }

    return NextResponse.json({ success: true, id: lead.id, reference: `SN-${lead.id.slice(0,8).toUpperCase()}` })
  } catch (e) {
    console.error('[apply] unexpected error:', e)
    return NextResponse.json({ error: 'Unexpected error. Please try again.' }, { status: 500 })
  }
}
