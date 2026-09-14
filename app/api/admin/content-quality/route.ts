import { NextResponse } from 'next/server'
import { isStaff } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { recordReviewIssues } from '@/lib/editorial-quality'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store, max-age=0' }

type ReviewItem = {
  id: string
  type: 'college' | 'news' | 'notice'
  title: string
  status: string | null
  reasons: string[]
  reviewHref: string
}

export async function GET() {
  if (!(await isStaff(['editor', 'owner']))) {
    return NextResponse.json({ error: 'Editor access required' }, { status: 403, headers })
  }

  const db = createAdminSupabaseClient()
  const [{ data: colleges, error: collegesError }, { data: news, error: newsError }, { data: notices, error: noticesError }] = await Promise.all([
    db.from('colleges').select('id,name,description,source_url,last_verified_at,status').order('name').limit(500),
    db.from('news').select('id,title,content,status,source_url,published_date').in('status', ['published', 'draft']).order('published_date', { ascending: false }).limit(500),
    db.from('notices').select('id,title,content,notice_url,published_date').order('published_date', { ascending: false }).limit(500),
  ])

  if (collegesError || newsError || noticesError) {
    return NextResponse.json({ error: 'Editorial records could not be loaded.' }, { status: 500, headers })
  }

  const items: ReviewItem[] = []
  for (const college of (colleges || []).filter((college) => college.status !== 'inactive')) {
    const reasons = recordReviewIssues({
      title: college.name,
      content: college.description,
      sourceUrl: college.source_url,
      publishedDate: college.last_verified_at,
    }).filter((reason) => !['Publication date is missing'].includes(reason))
    if (reasons.length) items.push({ id: college.id, type: 'college', title: college.name, status: college.status, reasons, reviewHref: `/admin/colleges/${college.id}/edit` })
  }
  for (const article of news || []) {
    const reasons = recordReviewIssues({
      title: article.title,
      content: article.content,
      sourceUrl: article.source_url,
      publishedDate: article.published_date,
      requireSummary: article.status === 'published',
    })
    if (reasons.length) items.push({ id: article.id, type: 'news', title: article.title, status: article.status, reasons, reviewHref: `/admin/news/${article.id}/edit` })
  }
  for (const notice of notices || []) {
    const reasons = recordReviewIssues({
      title: notice.title,
      content: notice.content,
      sourceUrl: notice.notice_url,
      publishedDate: notice.published_date,
    })
    if (reasons.length) items.push({ id: notice.id, type: 'notice', title: notice.title, status: null, reasons, reviewHref: `/admin/notices/${notice.id}/edit` })
  }

  const counts = { college: 0, news: 0, notice: 0 }
  items.forEach((item) => { counts[item.type] += 1 })
  const reasonCounts = new Map<string, number>()
  items.forEach((item) => item.reasons.forEach((reason) => reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1)))
  items.sort((a, b) => b.reasons.length - a.reasons.length || a.title.localeCompare(b.title))

  return NextResponse.json({
    summary: { reviewed: (colleges?.length || 0) + (news?.length || 0) + (notices?.length || 0), needs_attention: items.length, by_type: counts, common_reasons: Object.fromEntries(Array.from(reasonCounts.entries()).sort(([, a], [, b]) => b - a)) },
    items,
    generated_at: new Date().toISOString(),
  }, { headers })
}
