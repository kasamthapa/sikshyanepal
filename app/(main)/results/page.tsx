import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import ResultCard from '@/components/results/ResultCard'
import SearchBar from '@/components/ui/SearchBar'

export const dynamic = 'force-dynamic'
export const revalidate = 0
import type { Result } from '@/types'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'University Exam Results Nepal | TU, KU, NEB Results | SikshyaNepal',
  description: 'Check latest exam results from TU, KU, PU, NEB, and CTEVT. Get instant result notifications.',
}

const UNIVERSITIES = ['TU', 'KU', 'PU', 'PurU', 'NEB', 'CTEVT']

async function getResults(searchParams: { q?: string; university?: string }) {
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('results')
    .select('*, university:universities(id, name, short_name, slug, website, created_at)')
    .order('published_date', { ascending: false })

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }

  const { data } = await query.limit(50)
  let results = (data || []) as Result[]

  if (searchParams.university) {
    results = results.filter(
      (r) => r.university?.short_name?.toLowerCase() === searchParams.university?.toLowerCase()
    )
  }

  return results
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { q?: string; university?: string }
}) {
  const results = await getResults(searchParams)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
        </div>
        <p className="text-gray-500">Latest exam results from universities and boards in Nepal</p>
      </div>

      <div className="mb-6">
        <SearchBar placeholder="Search results..." redirectTo="/results" />
      </div>

      {/* University Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/results"
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            !searchParams.university ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
          }`}
        >
          All
        </Link>
        {UNIVERSITIES.map((u) => (
          <Link
            key={u}
            href={`/results?university=${u}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              searchParams.university === u ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {u}
          </Link>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">{results.length} results found</p>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-1">No results found</h3>
          <p className="text-sm text-gray-500">Check back later for new results</p>
        </div>
      )}
    </div>
  )
}
