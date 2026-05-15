import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import ResultCard from '@/components/results/ResultCard'
import SearchBar from '@/components/ui/SearchBar'
import type { Result } from '@/types'
import { FileText, RefreshCcw } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'University Exam Results Nepal | TU, KU, NEB Results | SikshyaNepal',
  description: 'Check latest exam results from TU, KU, PU, NEB, and CTEVT. Get instant result notifications.',
}

const UNIVERSITIES = ['TU', 'KU', 'PU', 'PurU', 'NEB', 'CTEVT']
const PROGRAMS     = ['BCA', 'BBA', 'BE', 'MBBS', 'BBS', 'BSc', 'BA', 'MA', 'MBS']

async function getResults(sp: { q?: string; university?: string; program?: string }) {
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('results')
    .select('*, university:universities(id, name, short_name, slug, website, created_at)')
    .order('published_date', { ascending: false })

  if (sp.q) query = query.ilike('title', `%${sp.q}%`)

  const { data } = await query.limit(100)
  let results = (data || []) as Result[]

  if (sp.university) {
    results = results.filter(
      (r) => r.university?.short_name?.toLowerCase() === sp.university?.toLowerCase()
    )
  }
  if (sp.program) {
    results = results.filter(
      (r) =>
        r.program?.toLowerCase().includes(sp.program!.toLowerCase()) ||
        r.title.toLowerCase().includes(sp.program!.toLowerCase())
    )
  }

  return results
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { q?: string; university?: string; program?: string }
}) {
  const results   = await getResults(searchParams)
  const hasFilter = !!(searchParams.university || searchParams.program || searchParams.q)

  function filterUrl(key: string, val: string) {
    const p = new URLSearchParams()
    if (searchParams.q)          p.set('q',          searchParams.q)
    if (searchParams.university) p.set('university', searchParams.university)
    if (searchParams.program)    p.set('program',    searchParams.program)
    if (p.get(key) === val) p.delete(key)
    else p.set(key, val)
    const s = p.toString()
    return `/results${s ? `?${s}` : ''}`
  }

  const pill = (active: boolean) =>
    active ? 'filter-pill-active' : 'filter-pill-inactive'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="mb-8">
        <p className="section-label">RESULTS</p>
        <h1 className="section-heading">Exam Results</h1>
        <p className="text-ink-secondary text-sm mt-1">
          Latest exam results from universities and boards in Nepal
        </p>
      </div>

      {/* ── Search ──────────────────────────────────────────── */}
      <div className="mb-5">
        <SearchBar placeholder="Search results by title or program..." redirectTo="/results" />
      </div>

      {/* ── University filter chips ──────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Link href={filterUrl('university', '')} className={pill(!searchParams.university)}>
          All Universities
        </Link>
        {UNIVERSITIES.map((u) => (
          <Link key={u} href={filterUrl('university', u)} className={pill(searchParams.university === u)}>
            {u}
          </Link>
        ))}
      </div>

      {/* ── Program filter chips ─────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PROGRAMS.map((prog) => (
          <Link key={prog} href={filterUrl('program', prog)} className={pill(searchParams.program === prog)}>
            {prog}
          </Link>
        ))}
      </div>

      {/* ── Result count ─────────────────────────────────────── */}
      <p className="text-sm text-ink-secondary mb-4">
        <span className="font-semibold text-ink">{results.length}</span>{' '}
        result{results.length !== 1 ? 's' : ''} found
        {searchParams.q && <> for &ldquo;{searchParams.q}&rdquo;</>}
      </p>

      {/* ── Results list ─────────────────────────────────────── */}
      {results.length > 0 ? (
        <div className="space-y-3">
          {results.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-ink-muted" />
          </div>
          <h3 className="text-base font-semibold text-ink mb-2">No results found</h3>
          <p className="text-sm text-ink-secondary mb-6 max-w-xs mx-auto">
            {hasFilter
              ? 'Try removing some filters or searching with different keywords.'
              : 'New exam results will appear here as soon as they are published.'}
          </p>
          {hasFilter && (
            <Link
              href="/results"
              className="btn-primary text-sm"
            >
              <RefreshCcw className="w-4 h-4" />
              Clear all filters
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
