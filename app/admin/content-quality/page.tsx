'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ExternalLink, FileSearch, RefreshCw } from 'lucide-react'

type ReviewItem = { id: string; type: 'college' | 'news' | 'notice'; title: string; status: string | null; reasons: string[]; reviewHref: string }
type Report = { summary: { reviewed: number; needs_attention: number; by_type: Record<'college' | 'news' | 'notice', number>; common_reasons: Record<string, number> }; items: ReviewItem[]; generated_at: string }

const label = { college: 'College profile', news: 'News article', notice: 'Notice' }

export default function ContentQualityPage() {
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [type, setType] = useState<'all' | ReviewItem['type']>('all')
  const [query, setQuery] = useState('')
  const load = async () => {
    setRefreshing(true); setError('')
    try {
      const response = await fetch(`/api/admin/content-quality?t=${Date.now()}`, { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Review report unavailable')
      setReport(data)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Review report unavailable') }
    finally { setRefreshing(false) }
  }
  useEffect(() => { load() }, [])
  const visibleItems = useMemo(() => (report?.items || []).filter((item) => {
    const matchesType = type === 'all' || item.type === type
    return matchesType && item.title.toLowerCase().includes(query.trim().toLowerCase())
  }), [report, query, type])

  if (error) return <div className="p-8 text-red-300">{error}</div>
  if (!report) return <div className="p-8 text-gray-400">Preparing editorial review…</div>

  return <main className="max-w-7xl p-6 text-gray-100 md:p-8">
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-700 pb-6">
      <div className="max-w-2xl"><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300"><FileSearch className="h-4 w-4" /> Editorial control</div><h1 className="text-2xl font-bold text-white">Review published content</h1><p className="mt-2 text-sm leading-6 text-gray-400">Find records that need a factual edit or a source check. This report is private and read-only; reviewing a row never changes public content by itself.</p></div>
      <button onClick={load} disabled={refreshing} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-600 px-3 text-sm font-semibold text-gray-200 transition-colors hover:bg-gray-800 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />{refreshing ? 'Refreshing…' : 'Refresh report'}</button>
    </header>
    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Records checked" value={report.summary.reviewed} tone="text-white" />
      <Metric label="Need individual review" value={report.summary.needs_attention} tone="text-amber-200" />
      <Metric label="College profiles" value={report.summary.by_type.college} tone="text-sky-200" />
      <Metric label="News and notices" value={report.summary.by_type.news + report.summary.by_type.notice} tone="text-sky-200" />
    </section>
    <section className="mt-6 rounded-xl border border-gray-700 bg-gray-800">
      <div className="border-b border-gray-700 px-5 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-white">Records needing a check</h2><p className="mt-1 text-xs text-gray-500">Generated {new Date(report.generated_at).toLocaleString('en-NP')}</p></div><span className="text-sm text-gray-400">{visibleItems.length} shown</span></div><div className="mt-4 flex flex-wrap gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title" className="min-h-10 min-w-48 flex-1 rounded-lg border border-gray-600 bg-gray-900 px-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-400" />{(['all', 'college', 'news', 'notice'] as const).map((option) => <button key={option} onClick={() => setType(option)} className={`min-h-10 rounded-lg px-3 text-xs font-bold ${type === option ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{option === 'all' ? 'All records' : label[option]}</button>)}</div></div>
      <div className="divide-y divide-gray-700/70">{visibleItems.map((item) => <article key={`${item.type}-${item.id}`} className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-start md:justify-between"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-md bg-gray-900 px-2 py-1 text-[11px] font-semibold text-gray-300">{label[item.type]}</span>{item.status && <span className="text-xs text-gray-500 capitalize">{item.status}</span>}</div><h3 className="text-sm font-semibold leading-6 text-white">{item.title}</h3><ul className="mt-3 flex flex-wrap gap-2">{item.reasons.map((reason) => <li key={reason} className="rounded-full bg-amber-950/60 px-2.5 py-1 text-xs text-amber-100">{reason}</li>)}</ul></div><Link href={item.reviewHref} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-gray-600 px-3 text-sm font-semibold text-gray-200 transition-colors hover:border-blue-400 hover:bg-gray-700 hover:text-white">Review record <ExternalLink className="h-3.5 w-3.5" /></Link></article>)}{!visibleItems.length && <div className="px-5 py-14 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300" /><p className="mt-3 text-sm font-semibold text-white">No records match this view.</p><p className="mt-1 text-sm text-gray-400">Change the filter or search term to continue reviewing.</p></div>}</div>
    </section>
  </main>
}

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className="rounded-xl border border-gray-700 bg-gray-800 p-4"><p className="text-xs font-medium text-gray-400">{label}</p><p className={`mt-1 text-3xl font-bold tabular-nums ${tone}`}>{value}</p></div>
}
