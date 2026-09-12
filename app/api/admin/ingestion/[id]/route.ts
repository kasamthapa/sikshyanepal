import { getAuthContext, writeAudit } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { editorialQualityError } from '@/lib/editorial-quality'

const fields: Record<string, string[]> = {
  news: ['title', 'slug', 'content', 'image_url', 'author_name', 'tags', 'published_date', 'source_name', 'source_url', 'content_category', 'education_levels', 'college_id', 'disclosure'],
  notice: ['title', 'slug', 'content', 'university_id', 'notice_url', 'published_date'],
  result: ['title', 'slug', 'program', 'semester', 'year', 'university_id', 'result_url', 'published_date'],
}
const tables = { news: 'news', notice: 'notices', result: 'results' } as const

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthContext()
  if (!auth || !['reviewer', 'editor', 'owner'].includes(auth.profile.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!['reviewing', 'approved', 'rejected'].includes(body.status)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  const db = createAdminSupabaseClient()
  const { data: item, error: readError } = await db.from('content_ingestion_items').select('*').eq('id', params.id).single()
  if (readError || !item) return NextResponse.json({ error: 'Queue item not found' }, { status: 404 })
  if (['approved', 'rejected'].includes(item.status)) return NextResponse.json({ error: 'This item was already reviewed' }, { status: 409 })

  let publishedId: string | null = null
  let evidenceId: string | null = null
  let evidenceWarning: string | null = null
  if (body.status === 'approved') {
    const allowed = fields[item.target_type]
    const table = tables[item.target_type as keyof typeof tables]
    if (!allowed || !table) return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
    const edited = { ...item.payload, ...(body.payload || {}) }
    const record = Object.fromEntries(allowed.filter((key) => edited[key] !== undefined).map((key) => [key, edited[key]]))
    if (item.target_type === 'news') {
      record.status = 'published'
      record.automation_mode = 'editor_approved'
      record.last_verified_at = new Date().toISOString()
      record.source_name = record.source_name || item.scraper_name
      record.source_url = record.source_url || item.source_url
      record.content_category = record.content_category || item.content_category || 'college_news'
      record.college_id = record.college_id || item.college_id || null
      if (String(record.content || '').trim().length < 200) return NextResponse.json({ error: 'Write an original summary of at least 200 characters before publishing.' }, { status: 400 })
      const qualityError = editorialQualityError(String(record.title || item.title || ''), String(record.content || ''))
      if (qualityError) return NextResponse.json({ error: qualityError }, { status: 400 })
    }
    const { data, error } = item.published_record_id
      ? await db.from(table).update(record).eq('id', item.published_record_id).select('id').single()
      : await db.from(table).insert(record).select('id').single()
    if (error) return NextResponse.json({ error: `Publish failed: ${error.message}` }, { status: 500 })
    publishedId = data.id

    const category = String(item.content_category || '').toLowerCase()
    const inferredField = category.includes('admission') ? 'admission_deadline' : category.includes('scholarship') ? 'scholarship' : category.includes('result') ? 'result' : category.includes('program') || category.includes('programme') ? 'programs' : category.includes('fee') ? 'fee' : null
    const proposal = body.evidence_proposal?.enabled
      ? body.evidence_proposal
      : inferredField ? { enabled: true, field_key: inferredField, claim_summary: String(record.title || item.title) } : null
    if (proposal?.enabled && item.college_id && ['affiliation','programs','fee','admission_deadline','scholarship','result','facilities','contact'].includes(proposal.field_key)) {
      const claim = String(proposal.claim_summary || '').trim()
      if (claim.length >= 3) {
        const { data: evidence, error: evidenceError } = await db.from('college_evidence').insert({
          college_id: item.college_id,
          field_key: proposal.field_key,
          claim_summary: claim.slice(0, 500),
          source_name: String(record.source_name || item.scraper_name).slice(0, 200),
          source_url: String(record.source_url || item.source_url),
          source_published_at: record.published_date || null,
          checked_at: new Date().toISOString(),
          confidence_score: Math.max(0, Math.min(100, Number(item.confidence_score) || 0)),
          verification_status: 'pending',
          extraction_method: 'automated_extraction',
        }).select('id').single()
        evidenceId = evidence?.id || null
        if (evidenceError) evidenceWarning = evidenceError.code === '42P01' ? 'Evidence Ledger migration is not installed.' : evidenceError.code === '23505' ? 'An active evidence proposal already uses this source and field.' : evidenceError.message
      }
    }
  }
  const { data, error } = await db.from('content_ingestion_items').update({
    status: body.status, reviewer_notes: String(body.reviewer_notes || '').slice(0, 2000) || null,
    verification_status: body.status === 'approved' ? 'editor_verified' : body.status === 'rejected' ? 'rejected' : 'pending',
    reviewed_at: ['approved', 'rejected'].includes(body.status) ? new Date().toISOString() : null,
    reviewed_by: auth.user.email || auth.user.id, published_record_id: publishedId,
  }).eq('id', params.id).select().single()
  if (!error) await writeAudit(`ingestion.${body.status}`, 'content_ingestion', params.id, { title: item.title, target_type: item.target_type, published_record_id: publishedId, evidence_id: evidenceId, evidence_warning: evidenceWarning })
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ...data, evidence_id: evidenceId, evidence_warning: evidenceWarning })
}
