'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { GitCompare, X, Plus, MapPin, Star, Building2, Search, Award, BookOpen, Check } from 'lucide-react'

interface College {
  id: string
  name: string
  slug: string
  location: string
  affiliation: string | null
  established_year: number | null
  is_featured: boolean
  avg_rating?: number
  review_count?: number
  program_count?: number
  scholarship_count?: number
}

const MAX = 3

const ROW_LABELS = [
  { key: 'location', label: 'Location', icon: MapPin },
  { key: 'affiliation', label: 'Affiliation', icon: Building2 },
  { key: 'established_year', label: 'Established', icon: null },
  { key: 'program_count', label: 'Programs', icon: BookOpen },
  { key: 'avg_rating', label: 'Avg Rating', icon: Star },
  { key: 'review_count', label: 'Reviews', icon: null },
  { key: 'scholarship_count', label: 'Scholarships', icon: Award },
]


export default function ComparePage() {
  const [selected, setSelected] = useState<College[]>([])
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<College[]>([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [detailData, setDetailData] = useState<Record<string, { programs: number; reviews: { rating: number }[]; scholarships: number }>>({})

  const searchColleges = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setSearching(true)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/colleges?name=ilike.*${encodeURIComponent(q)}*&select=id,name,slug,location,affiliation,established_year,is_featured&limit=10`,
      { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}` } }
    )
    const data = await res.json()
    setResults(data || [])
    setSearching(false)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => searchColleges(search), 300)
    return () => clearTimeout(t)
  }, [search, searchColleges])

  const loadDetail = useCallback(async (college: College) => {
    if (detailData[college.id]) return
    const [programsRes, reviewsRes, scholarshipsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/college_programs?college_id=eq.${college.id}&select=id`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}` },
      }),
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/reviews?college_id=eq.${college.id}&is_approved=eq.true&select=rating`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}` },
      }),
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/scholarships?college_id=eq.${college.id}&select=id`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}` },
      }),
    ])
    const [programs, reviews, scholarships] = await Promise.all([programsRes.json(), reviewsRes.json(), scholarshipsRes.json()])
    setDetailData(prev => ({ ...prev, [college.id]: { programs: programs?.length || 0, reviews: reviews || [], scholarships: scholarships?.length || 0 } }))
  }, [detailData])

  const addCollege = (college: College) => {
    if (selected.length >= MAX || selected.find(c => c.id === college.id)) return
    setSelected(prev => [...prev, college])
    loadDetail(college)
    setSearch('')
    setResults([])
    setShowSearch(false)
  }

  const removeCollege = (id: string) => setSelected(prev => prev.filter(c => c.id !== id))

  const getVal = (college: College, key: string) => {
    const d = detailData[college.id]
    switch (key) {
      case 'location': return college.location || '—'
      case 'affiliation': return college.affiliation || '—'
      case 'established_year': return college.established_year?.toString() || '—'
      case 'program_count': return d ? d.programs.toString() : '...'
      case 'avg_rating': return d && d.reviews.length > 0 ? (d.reviews.reduce((a, r) => a + r.rating, 0) / d.reviews.length).toFixed(1) : '—'
      case 'review_count': return d ? d.reviews.length.toString() : '...'
      case 'scholarship_count': return d ? d.scholarships.toString() : '...'
      default: return '—'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <GitCompare className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Compare Colleges</h1>
        </div>
        <p className="text-gray-500">Select up to {MAX} colleges to compare side-by-side</p>
      </div>

      {/* College Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((i) => {
          const college = selected[i]
          return (
            <div key={i} className="relative">
              {college ? (
                <div className="bg-white rounded-xl border-2 border-blue-200 p-4">
                  <button onClick={() => removeCollege(college.id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-lg mb-3">
                    {college.name.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-6">{college.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {college.location}
                  </p>
                  <Link href={`/colleges/${college.slug}`}
                    className="mt-3 inline-block text-xs text-blue-600 hover:underline">View Profile →</Link>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-full bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center hover:border-blue-300 transition-colors group">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-50">
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-500 group-hover:text-blue-600">Add College {i + 1}</p>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4" onClick={() => setShowSearch(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search colleges by name..."
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {searching && <div className="text-center py-8 text-gray-400 text-sm">Searching...</div>}
              {!searching && search && results.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">No colleges found</div>
              )}
              {!searching && !search && (
                <div className="text-center py-8 text-gray-400 text-sm">Start typing to search colleges</div>
              )}
              {results.map(college => {
                const alreadyAdded = !!selected.find(c => c.id === college.id)
                return (
                  <button key={college.id} onClick={() => !alreadyAdded && addCollege(college)} disabled={alreadyAdded}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${alreadyAdded ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                      {college.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">{college.name}</p>
                      <p className="text-xs text-gray-500">{college.location} {college.affiliation && `• ${college.affiliation}`}</p>
                    </div>
                    {alreadyAdded && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
            <div className="p-3 border-t border-gray-100">
              <button onClick={() => setShowSearch(false)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {selected.length >= 2 ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 w-40">Feature</th>
                  {selected.map(c => (
                    <th key={c.id} className="px-6 py-4 text-center">
                      <div className="font-semibold text-gray-900 text-sm">{c.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{c.location}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROW_LABELS.map(({ key, label }, idx) => (
                  <tr key={key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{label}</td>
                    {selected.map(college => {
                      const val = getVal(college, key)
                      return (
                        <td key={college.id} className="px-6 py-4 text-center text-sm text-gray-800">
                          {key === 'avg_rating' && val !== '—' && val !== '...' ? (
                            <span className="inline-flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                              <span className="font-semibold">{val}</span>
                            </span>
                          ) : (
                            <span className={val === '—' ? 'text-gray-400' : 'font-medium'}>{val}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">Profile</td>
                  {selected.map(c => (
                    <td key={c.id} className="px-6 py-4 text-center">
                      <Link href={`/colleges/${c.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        View Profile
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : selected.length === 1 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <GitCompare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Add at least one more college to start comparing</p>
          <button onClick={() => setShowSearch(true)}
            className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            + Add College
          </button>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <GitCompare className="w-14 h-14 text-gray-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-2">No Colleges Selected</h3>
          <p className="text-sm text-gray-400 mb-5 max-w-sm mx-auto">Search and select colleges above to compare fees, programs, ratings, and more side-by-side</p>
          <button onClick={() => setShowSearch(true)}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
            Start Comparing
          </button>
        </div>
      )}
    </div>
  )
}
