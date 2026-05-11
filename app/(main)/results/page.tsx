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
      (r) => r.program?.toLowerCase().includes(sp.program!.toLowerCase()) ||
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
  const results = await getResults(searchParams)
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
    `px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
      active
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
    }`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
        </div>
        <p className="text-gray-500 text-sm">Latest exam results from universities and boards in Nepal</p>
      </div>

      <div className="mb-5">
        <SearchBar placeholder="Search results..." redirectTo="/results" />
      </div>

      {/* University filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link href={filterUrl('university', '')} className={pill(!searchParams.university)}>
          All
        </Link>
        {UNIVERSITIES.map((u) => (
          <Link key={u} href={filterUrl('university', u)} className={pill(searchParams.university === u)}>
            {u}
          </Link>
        ))}
      </div>

      {/* Program filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PROGRAMS.map((prog) => (
          <Link key={prog} href={filterUrl('program', prog)} className={pill(searchParams.program === prog)}>
            {prog}
          </Link>
        ))}
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-500 mb-4">
        <span className="font-semibold text-gray-900">{results.length}</span> result{results.length !== 1 ? 's' : ''} found
        {searchParams.q && <> for &quot;{searchParams.q}&quot;</>}
      </p>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <FileText className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
            {hasFilter
              ? 'Try removing some filters or searching with different keywords.'
              : 'New exam results will appear here as soon as they are published.'}
          </p>
          {hasFilter && (
            <Link
              href="/results"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
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
