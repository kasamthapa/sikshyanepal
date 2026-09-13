'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, X } from 'lucide-react'

const TRENDING = [
  { label: 'Admissions open', href: '/admissions' },
  { label: 'Schools near me', href: '/schools' },
  { label: 'TU Results',   href: '/results?university=TU' },
  { label: 'KU Notices',   href: '/notices?university=KU' },
  { label: 'BCA Colleges', href: '/colleges?q=BCA' },
  { label: 'NEB Results',  href: '/results?university=NEB' },
  { label: 'Scholarships', href: '/scholarships' },
]

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="w-full">
      {/* ── Search bar ─────────────────────────────────── */}
      <form onSubmit={handleSubmit} role="search" aria-label="Search SikshyaNepal">
        <div className="flex items-stretch border-2 border-gray-200 rounded-xl bg-white overflow-hidden
                        shadow-card-md focus-within:border-blue-500 focus-within:shadow-card-lg
                        transition-all duration-150">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “BCA colleges in Kathmandu”"
              aria-label="Search schools, colleges, programs and results"
              aria-describedby="hero-search-help"
              autoComplete="off"
              enterKeyHint="search"
              inputMode="search"
              className="h-14 w-full min-w-0 bg-transparent pl-11 pr-11 text-sm text-ink placeholder:text-gray-400 focus:outline-none sm:pl-12 sm:pr-12"
            />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-1 flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X className="h-4 w-4" /></button>}
          </div>
          <button
            type="submit"
            className="m-1.5 flex-shrink-0 bg-[#1847c4] px-4 text-sm font-semibold text-white sm:px-6
                       rounded-lg hover:bg-[#1340b0] transition-colors duration-150 active:scale-[0.98]"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}
          >
            Search
          </button>
        </div>
      </form>

      <p id="hero-search-help" className="mt-2 text-xs leading-5 text-gray-500">
        Search by college, programme, city, university, result or notice.
      </p>

      {/* ── Trending tags ──────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mt-3.5">
        <span className="text-xs font-medium text-gray-400">Trending:</span>
        {TRENDING.map((tag) => (
          <Link
            key={tag.label}
            href={tag.href}
            className="inline-flex min-h-11 items-center px-3 rounded-full text-xs font-medium text-gray-600
                       border border-gray-200 bg-white
                       hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700
                       transition-all duration-150"
          >
            {tag.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
