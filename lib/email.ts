import { Resend } from 'resend'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { Result } from '@/types'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sikshyanepal.vercel.app'
const FROM_EMAIL = 'SikshyaNepal <onboarding@resend.dev>'

// ── HTML email template ──────────────────────────────────────────────────────

function buildEmailHtml(results: Result[]): string {
  const preview   = results.slice(0, 5)
  const remaining = results.length - preview.length

  const resultRows = preview
    .map(
      (r) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;padding-right:12px;">
              <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0f1629;line-height:1.4;">
                ${r.title}
              </p>
              <span style="display:inline-block;padding:2px 8px;background:#dde6fd;color:#1847c4;
                           border-radius:4px;font-size:11px;font-weight:700;font-family:monospace;">
                ${r.university?.short_name ?? 'University'}
              </span>
            </td>
            <td style="vertical-align:middle;white-space:nowrap;">
              <a href="${BASE_URL}/results/${r.slug}"
                 style="display:inline-block;padding:8px 16px;background:#1847c4;color:#ffffff;
                        font-size:12px;font-weight:600;text-decoration:none;border-radius:6px;">
                View Result →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`,
    )
    .join('')

  const moreLink =
    remaining > 0
      ? `<p style="margin:16px 0 0;text-align:center;">
           <a href="${BASE_URL}/results" style="color:#1847c4;font-size:13px;font-weight:600;text-decoration:none;">
             and ${remaining} more result${remaining > 1 ? 's' : ''} →
           </a>
         </p>`
      : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Exam Results — SikshyaNepal</title>
</head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1847c4;border-radius:12px 12px 0 0;padding:24px 32px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">
                SikshyaNepal
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:#a5c0fa;">
                College, admission and result updates for Nepal
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f1629;">
                New Exam Results Available
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
                ${results.length} new result${results.length > 1 ? 's have' : ' has'} just been published on SikshyaNepal.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                ${resultRows}
              </table>
              ${moreLink}

              <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f0f0f0;text-align:center;">
                <a href="${BASE_URL}/results"
                   style="display:inline-block;padding:12px 28px;background:#1847c4;color:#ffffff;
                          font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
                  View All Results on SikshyaNepal
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px;
                       padding:20px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">
                You&apos;re receiving this because you subscribed to result alerts on SikshyaNepal.
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                <a href="${BASE_URL}/api/unsubscribe?email={{EMAIL}}&token={{TOKEN}}"
                   style="color:#6b7280;text-decoration:underline;">
                  Unsubscribe
                </a>
                &nbsp;·&nbsp; SikshyaNepal, Nepal
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Main send function ───────────────────────────────────────────────────────

export async function sendResultNotification(results: Result[]): Promise<{ sent: number; errors: number }> {
  if (!results.length) return { sent: 0, errors: 0 }
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping notification')
    return { sent: 0, errors: 0 }
  }

  const supabase = createServerSupabaseClient()
  const { data: subscribers, error } = await supabase
    .from('subscribers')
    .select('email, token')
    .eq('is_active', true)

  if (error || !subscribers?.length) {
    console.warn('[email] No active subscribers or fetch error:', error?.message)
    return { sent: 0, errors: 0 }
  }

  const subject = `📢 ${results.length} New Result${results.length > 1 ? 's' : ''} Published on SikshyaNepal`
  const htmlBase = buildEmailHtml(results)

  let sent   = 0
  let errors = 0
  const BATCH = 50

  for (let i = 0; i < subscribers.length; i += BATCH) {
    const batch = subscribers.slice(i, i + BATCH)

    await Promise.allSettled(
      batch.map(async (sub) => {
        const html = htmlBase
          .replace('{{EMAIL}}', encodeURIComponent(sub.email))
          .replace('{{TOKEN}}', encodeURIComponent(sub.token ?? ''))

        try {
          const { error: sendError } = await resend.emails.send({
            from:    FROM_EMAIL,
            to:      sub.email,
            subject,
            html,
          })
          if (sendError) {
            console.error(`[email] Failed for ${sub.email}:`, sendError.message)
            errors++
          } else {
            sent++
          }
        } catch (e) {
          console.error(`[email] Exception for ${sub.email}:`, e)
          errors++
        }
      }),
    )
  }

  console.log(`[email] Notification complete — sent: ${sent}, errors: ${errors}`)
  return { sent, errors }
}
