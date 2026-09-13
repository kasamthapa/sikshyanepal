import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

function ics(value: string) { return value.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n') }
function stamp(value: string) { return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') }
function allDayStamp(value: string) { return new Date(value).toISOString().slice(0, 10).replace(/-/g, '') }
function nextDayStamp(value: string) { const date = new Date(value); date.setUTCDate(date.getUTCDate() + 1); return date.toISOString().slice(0, 10).replace(/-/g, '') }
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!UUID_PATTERN.test(params.id)) return NextResponse.json({ error: 'Invalid admission.' }, { status: 400 })
  const { data, error } = await createServerSupabaseClient().from('admissions').select('id,title,institution_name,application_deadline,source_url,last_verified_at,status').eq('id', params.id).eq('status', 'published').maybeSingle()
  if (error) { console.error('[admission-calendar]', error); return NextResponse.json({ error: 'Calendar download is temporarily unavailable.' }, { status: 503 }) }
  if (!data?.application_deadline) return NextResponse.json({ error: 'Deadline not found.' }, { status: 404 })
  const checked = data.last_verified_at ? new Date(data.last_verified_at) : null
  const checkedText = checked && !Number.isNaN(checked.getTime()) ? ` Last checked ${checked.toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}.` : ''
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SikshyaNepal//Admissions//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', `UID:admission-${data.id}@sikshyanepal`, `DTSTAMP:${stamp(new Date().toISOString())}`, `DTSTART;VALUE=DATE:${allDayStamp(data.application_deadline)}`, `DTEND;VALUE=DATE:${nextDayStamp(data.application_deadline)}`, `SUMMARY:${ics(`Admission deadline: ${data.title}`)}`, `DESCRIPTION:${ics(`${data.institution_name || 'Institution'}. Confirm details${data.source_url ? `: ${data.source_url}` : ' on the official notice'}.${checkedText}`)}`, ...(data.source_url ? [`URL:${ics(data.source_url)}`] : []), 'BEGIN:VALARM', 'TRIGGER:-P2D', 'ACTION:DISPLAY', 'DESCRIPTION:Admission deadline in 2 days', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n')
  return new NextResponse(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `attachment; filename="admission-${data.id}.ics"`, 'Cache-Control': 'public, max-age=300' } })
}
