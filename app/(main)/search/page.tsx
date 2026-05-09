'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Building2, BookOpen, Newspaper, FileText, GraduationCap, Award } from 'lucide-react'

interface SearchResults {
  colleges: { id: string; name: string; slug: string; location: string; affiliation: string | null }[]
  programs: { id: string; name: string; faculty: string; duration: string }[]
  news: { id: string; title: string; slug: string; published_date: string | null }[]
  notices: { id: string; title: string; slug: string; published_date: string | null }[]
  results: { id: string; title: string; slug: string; published_date: string | null }[]
  scholarships: { id: string; title: string; amount: string | null; deadline: string | null }[]
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const headers = { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }

async function fetchAll(q: string): Promise<SearchResults> {
  const enc = encodeURIComponent(q)
  const [colleges, programs, news, notices, results, scholarships] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/colleges?name=ilike.*${enc}*&select=id,name,slug,location,affiliation&limit=8`, { headers }).then(r => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/programs?name=ilike.*${enc}*&select=id,name,faculty,duration&limit=6`, { headers }).then(r => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/news?title=ilike.*${enc}*&select=id,title,slug,published_date&order=published_date.desc&limit=6`, { headers }).then(r => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/notices?title=ilike.*${enc}*&select=id,title,slug,published_date&order=published_date.desc&limit=6`, { headers }).then(r => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/results?title=ilike.*${enc}*&select=id,title,slug,published_date&order=published_date.desc&limit=6`, { headers }).then(r => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/scholarships?title=ilike.*${enc}*&select=id,title,amount,deadline&limit=6`, { headers }).then(r => r.json()),
  ])
  return {
    colleges: colleges || [],
    programs: programs || [],
    news: news || [],
    notices: notices || [],
    results: results || [],
    scholarships: scholarships || [],
  }
}

function SearchPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQ)
  const [inputVal, setInputVal] = useState(initialQ)
  const [data, setData] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setData(null); return }
    setLoading(true)
    const res = await fetchAll(q.trim())
    setData(res)
    setLoading(false)
  }, [])

  useEffect(() => {
    runSearch(query)
  }, [query, runSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputVal.trim()
    if (!trimmed) return
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    setQuery(trimmed)
  }

  const totalResults = data
    ? data.colleges.length + data.programs.length + data.news.length +
      data.notices.length + data.results.length + data.scholarships.length
    : 0

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Search Bar */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-5">Search SikshyaNepal</h1>
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Search colleges, programs, news, scholarships..."
            className="w-full pl-12 pr-28 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Status */}
      {loading && (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-8 h-8 mx-auto mb-3 animate-pulse" />
          <p className="text-sm">Searching...</p>
        </div>
      )}

      {!loading && query && data && totalResults === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="font-medium text-gray-700 mb-1">No results found for &ldquo;{query}&rdquo;</p>
          <p className="text-sm">Try a different search term or browse by category</p>
        </div>
      )}

      {!loading && query && data && totalResults > 0 && (
        <p className="text-sm text-gray-500 mb-6">
          Found <strong className="text-gray-800">{totalResults}</strong> results for &ldquo;{query}&rdquo;
        </p>
      )}

      {!loading && !query && (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm">Enter a search term above to get started</p>
        </div>
      )}

      {/* Results */}
      {!loading && data && (
        <div className="space-y-8">
          {/* Colleges */}
          {data.colleges.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h2 className="font-semibold text-gray-800">Colleges ({data.colleges.length})</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.colleges.map(c => (
                  <Link key={c.id} href={`/colleges/${c.slug}`}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">{c.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.location}{c.affiliation && ` • ${c.affiliation}`}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Programs */}
          {data.programs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <h2 className="font-semibold text-gray-800">Programs ({data.programs.length})</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.programs.map(p => (
                  <Link key={p.id} href={`/programs`}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all">
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.faculty} • {p.duration}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* News */}
          {data.news.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Newspaper className="w-4 h-4 text-green-600" />
                <h2 className="font-semibold text-gray-800">News ({data.news.length})</h2>
              </div>
              <div className="space-y-2">
                {data.news.map(n => (
                  <Link key={n.id} href={`/news/${n.slug}`}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all">
                    <p className="font-medium text-gray-900 text-sm line-clamp-1 flex-1">{n.title}</p>
                    {n.published_date && (
                      <span className="text-xs text-gray-400 ml-4 flex-shrink-0">
                        {new Date(n.published_date).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Notices */}
          {data.notices.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-orange-600" />
                <h2 className="font-semibold text-gray-800">Notices ({data.notices.length})</h2>
              </div>
              <div className="space-y-2">
                {data.notices.map(n => (
                  <Link key={n.id} href={`/notices/${n.slug}`}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all">
                    <p className="font-medium text-gray-900 text-sm line-clamp-1 flex-1">{n.title}</p>
                    {n.published_date && (
                      <span className="text-xs text-gray-400 ml-4 flex-shrink-0">
                        {new Date(n.published_date).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Exam Results */}
          {data.results.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-red-600" />
                <h2 className="font-semibold text-gray-800">Exam Results ({data.results.length})</h2>
              </div>
              <div className="space-y-2">
                {data.results.map(r => (
                  <Link key={r.id} href={`/results/${r.slug}`}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-sm transition-all">
                    <p className="font-medium text-gray-900 text-sm line-clamp-1 flex-1">{r.title}</p>
                    {r.published_date && (
                      <span className="text-xs text-gray-400 ml-4 flex-shrink-0">
                        {new Date(r.published_date).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Scholarships */}
          {data.scholarships.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-yellow-600" />
                <h2 className="font-semibold text-gray-800">Scholarships ({data.scholarships.length})</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.scholarships.map(s => (
                  <Link key={s.id} href={`/scholarships`}
                    className="p-4 bg-white rounded-xl border border-gray-200 hover:border-yellow-300 hover:shadow-sm transition-all">
                    <p className="font-medium text-gray-900 text-sm line-clamp-1">{s.title}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {s.amount && <span className="text-xs text-green-700 font-medium">NPR {s.amount}</span>}
                      {s.deadline && (
                        <span className="text-xs text-gray-400">
                          Deadline: {new Date(s.deadline).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-gray-400">
        <Search className="w-8 h-8 mx-auto mb-3 animate-pulse" />
        <p className="text-sm">Loading search...</p>
      </div>
    }>
      <SearchPageInner />
    </Suspense>
  )
}
