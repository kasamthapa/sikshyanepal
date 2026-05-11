import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import CollegeCard from '@/components/colleges/CollegeCard'
import CollegeFilters from '@/components/colleges/CollegeFilters'
import SearchBar from '@/components/ui/SearchBar'
import type { College, CollegeProgram, Review } from '@/types'
import { Building2 } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'All Colleges in Nepal | SikshyaNepal',
  description: 'Browse all colleges in Nepal. Filter by location, affiliation, faculty, and more.',
}

// Extended type with server-computed fields the card needs
type RichCollege = College & {
  avg_rating?:   number
  review_count?: number
  fee_min?:      number
  fee_max?:      number
}

async function getColleges(sp: {
  q?:           string
  location?:    string
  affiliation?: string
  faculty?:     string
  level?:       string
}): Promise<{ all: RichCollege[]; filtered: RichCollege[] }> {
  const supabase = createServerSupabaseClient()

  let query = supabase
    .from('colleges')
    .select(`
      *,
      programs:college_programs(
        fee,
        scholarship_available,
        program:programs(id, name, faculty, degree_level)
      ),
      reviews(rating, is_approved)
    `)
    .order('is_featured', { ascending: false })
    .order('name')
    .limit(200)

  if (sp.q)           query = query.ilike('name',        `%${sp.q}%`)
  if (sp.location)    query = query.ilike('location',    `%${sp.location}%`)
  if (sp.affiliation) query = query.ilike('affiliation', `%${sp.affiliation}%`)

  const { data } = await query
  const raw = (data ?? []) as (College & { programs?: CollegeProgram[]; reviews?: Review[] })[]

  // Compute avg_rating, review_count, fee range on the server
  const enriched: RichCollege[] = raw.map((c) => {
    const approved = (c.reviews ?? []).filter((r) => r.is_approved)
    const avg_rating =
      approved.length > 0
        ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length
        : undefined
    const fees = (c.programs ?? []).map((cp) => cp.fee).filter((f): f is number => f != null)
    return {
      ...c,
      avg_rating,
      review_count: approved.length > 0 ? approved.length : undefined,
      fee_min: fees.length > 0 ? Math.min(...fees) : undefined,
      fee_max: fees.length > 0 ? Math.max(...fees) : undefined,
    }
  })

  // "all" = before faculty/level filter (denominator for "X of Y")
  const all = enriched

  // Faculty/level need nested program data — apply in JS
  let filtered = enriched
  if (sp.faculty) {
    const fac = sp.faculty.toLowerCase()
    filtered = filtered.filter((c) =>
      (c.programs ?? []).some((cp) => cp.program?.faculty?.toLowerCase() === fac)
    )
  }
  if (sp.level) {
    filtered = filtered.filter((c) =>
      (c.programs ?? []).some((cp) => cp.program?.degree_level === sp.level)
    )
  }

  return { all, filtered }
}

export default async function CollegesPage({
  searchParams,
}: {
  searchParams: { q?: string; location?: string; affiliation?: string; faculty?: string; level?: string }
}) {
  const { all, filtered } = await getColleges(searchParams)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Colleges in Nepal</h1>
        </div>
        <p className="text-gray-500 text-sm">Find and compare colleges across Nepal</p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <SearchBar placeholder="Search college by name..." redirectTo="/colleges" />
      </div>

      {/* Filters — handles mobile drawer + desktop inline panel + result counts */}
      <CollegeFilters
        searchParams={searchParams}
        totalCount={all.length}
        filteredCount={filtered.length}
      />

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((college) => (
            <CollegeCard key={college.id} college={college} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Building2 className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No colleges found</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
            Try changing your filters or search term — there are lots of great colleges here.
          </p>
          <Link
            href={searchParams.q ? `/colleges?q=${encodeURIComponent(searchParams.q)}` : '/colleges'}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Clear filters
          </Link>
        </div>
      )}
    </div>
  )
}
