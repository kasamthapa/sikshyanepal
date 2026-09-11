import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'

const TYPES = ['internship', 'apprenticeship', 'fellowship', 'competition', 'course', 'volunteering', 'project']
const validUrl = (value: unknown) => { if (typeof value !== 'string') return false; try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false } }
const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const validDate = (value: unknown) => !value || (typeof value === 'string' && Number.isFinite(new Date(value).getTime()))

export async function GET() {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await createAdminSupabaseClient().from('student_opportunities').select('*').order('created_at', { ascending: false })
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data || [], { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: Record<string, unknown>
  try { const parsed: unknown = await request.json(); if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error(); body = parsed as Record<string, unknown> } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  const title=text(body.title,180), organisation=text(body.organisation,140), summary=text(body.summary,1200)
  if (!title || !organisation || !summary || !TYPES.includes(body.opportunity_type as string) || !validUrl(body.application_url) || !validUrl(body.source_url)) {
    return NextResponse.json({ error: 'Title, organisation, type, summary, application link and official source are required.' }, { status: 400 })
  }
  if (!validDate(body.deadline)) return NextResponse.json({ error: 'Choose a valid application deadline.' }, { status: 400 })
  const published = Boolean(body.is_published)
  if (published && body.deadline && new Date(body.deadline as string).getTime() < Date.now()) return NextResponse.json({ error: 'A closed opportunity cannot be newly published.' }, { status: 400 })
  const now = new Date().toISOString()
  const row = {
    title, slug: `${slugify(title)}-${Date.now()}`, opportunity_type: body.opportunity_type,
    organisation, location: text(body.location,140) || null, eligibility: text(body.eligibility,600) || null,
    summary, application_url: text(body.application_url,500), source_url: text(body.source_url,500),
    deadline: body.deadline || null, is_verified: published, is_published: published, last_verified_at: now, updated_at: now,
  }
  const { data, error } = await createAdminSupabaseClient().from('student_opportunities').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('opportunity.create', 'student_opportunity', data.id, { title: data.title, published })
  return NextResponse.json(data, { status: 201 })
}
