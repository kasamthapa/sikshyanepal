'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Filter, X, SlidersHorizontal } from 'lucide-react'

const LOCATIONS = ['Kathmandu', 'Pokhara', 'Chitwan', 'Biratnagar', 'Butwal', 'Other']

const AFFILIATIONS = [
  { label: 'TU',    value: 'Tribhuvan University' },
  { label: 'KU',    value: 'Kathmandu University' },
  { label: 'PU',    value: 'Pokhara University' },
  { label: 'PurU',  value: 'Purbanchal University' },
  { label: 'Private', value: 'Private' },
]

const FACULTIES = [
  'IT', 'Management', 'Engineering', 'Medical',
  'Humanities', 'Law', 'Nursing', 'Education',
]

const LEVELS = [
  { label: 'Bachelor', value: 'bachelor' },
  { label: 'Master',   value: 'master'   },
  { label: 'Diploma',  value: 'diploma'  },
]

export type CollegeSearchParams = {
  q?:          string
  location?:   string
  affiliation?: string
  faculty?:    string
  level?:      string
}

function buildUrl(current: CollegeSearchParams, key: string, value: string): string {
  const p = new URLSearchParams()
  if (current.q)           p.set('q',           current.q)
  if (current.location)    p.set('location',    current.location)
  if (current.affiliation) p.set('affiliation', current.affiliation)
  if (current.faculty)     p.set('faculty',     current.faculty)
  if (current.level)       p.set('level',       current.level)
  // toggle: clicking an active filter removes it
  if (p.get(key) === value) p.delete(key)
  else p.set(key, value)
  const str = p.toString()
  return `/colleges${str ? `?${str}` : ''}`
}

function clearUrl(current: CollegeSearchParams): string {
  return current.q ? `/colleges?q=${encodeURIComponent(current.q)}` : '/colleges'
}

interface Props {
  searchParams:  CollegeSearchParams
  totalCount:    number
  filteredCount: number
}

export default function CollegeFilters({ searchParams, totalCount, filteredCount }: Props) {
  const [open, setOpen] = useState(false)

  const hasFilters  = !!(searchParams.location || searchParams.affiliation || searchParams.faculty || searchParams.level)
  const activeCount = [searchParams.location, searchParams.affiliation, searchParams.faculty, searchParams.level].filter(Boolean).length

  const pill = (isActive: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
      isActive
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
    }`

  function FilterContent() {
    return (
      <div className="space-y-5">
        {/* Location */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Location</p>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map((loc) => (
              <Link key={loc} href={buildUrl(searchParams, 'location', loc)}
                onClick={() => setOpen(false)} className={pill(searchParams.location === loc)}>
                {loc}
              </Link>
            ))}
          </div>
        </div>

        {/* Affiliation */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">University</p>
          <div className="flex flex-wrap gap-2">
            {AFFILIATIONS.map((aff) => (
              <Link key={aff.value} href={buildUrl(searchParams, 'affiliation', aff.value)}
                onClick={() => setOpen(false)} className={pill(searchParams.affiliation === aff.value)}>
                {aff.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Faculty */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Faculty</p>
          <div className="flex flex-wrap gap-2">
            {FACULTIES.map((fac) => (
              <Link key={fac} href={buildUrl(searchParams, 'faculty', fac)}
                onClick={() => setOpen(false)} className={pill(searchParams.faculty === fac)}>
                {fac}
              </Link>
            ))}
          </div>
        </div>

        {/* Degree level */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Degree Level</p>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((lvl) => (
              <Link key={lvl.value} href={buildUrl(searchParams, 'level', lvl.value)}
                onClick={() => setOpen(false)} className={pill(searchParams.level === lvl.value)}>
                {lvl.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ── Mobile trigger + result count ── */}
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{filteredCount}</span>
          {filteredCount !== totalCount && <> of <span className="font-semibold text-gray-900">{totalCount}</span></>}{' '}
          colleges
        </p>
        <button
          onClick={() => setOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
            hasFilters
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters{activeCount > 0 && ` (${activeCount})`}
        </button>
      </div>

      {/* ── Desktop filter panel ── */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Filters</span>
          </div>
          {hasFilters && (
            <Link href={clearUrl(searchParams)}
              className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Clear all
            </Link>
          )}
        </div>
        <FilterContent />
      </div>

      {/* ── Desktop result count ── */}
      <p className="hidden lg:block text-sm text-gray-500 mb-4">
        Showing{' '}
        <span className="font-semibold text-gray-900">{filteredCount}</span>
        {filteredCount !== totalCount && (
          <> of <span className="font-semibold text-gray-900">{totalCount}</span></>
        )}{' '}
        colleges
        {searchParams.q && <> for &quot;{searchParams.q}&quot;</>}
      </p>

      {/* ── Mobile bottom drawer ── */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold">Filters</h3>
              </div>
              <div className="flex items-center gap-3">
                {hasFilters && (
                  <Link href={clearUrl(searchParams)} onClick={() => setOpen(false)}
                    className="text-sm text-red-500 font-medium">
                    Clear all
                  </Link>
                )}
                <button onClick={() => setOpen(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <FilterContent />

            <div className="pt-5 mt-4 border-t border-gray-100">
              <button onClick={() => setOpen(false)}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Show {filteredCount} college{filteredCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
