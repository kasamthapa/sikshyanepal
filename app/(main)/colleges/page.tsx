import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import CollegeCard from '@/components/colleges/CollegeCard'
import SearchBar from '@/components/ui/SearchBar'

export const dynamic = 'force-dynamic'
import type { College } from '@/types'
import { Building2, Filter } from 'lucide-react'

export const metadata: Metadata = {
  title: 'All Colleges in Nepal | SikshyaNepal',
  description: 'Browse all colleges in Nepal. Filter by location, affiliation, faculty, and more.',
}

const LOCATIONS = ['Kathmandu', 'Pokhara', 'Biratnagar', 'Butwal', 'Dharan', 'Chitwan']
const AFFILIATIONS = ['Tribhuvan University', 'Kathmandu University', 'Pokhara University', 'Purbanchal University']

async function getColleges(searchParams: { q?: string; location?: string; affiliation?: string }) {
  const supabase = createServerSupabaseClient()
  let query = supabase.from('colleges').select('*').order('is_featured', { ascending: false }).order('name')

  if (searchParams.q) {
    query = query.ilike('name', `%${searchParams.q}%`)
  }
  if (searchParams.location) {
    query = query.ilike('location', `%${searchParams.location}%`)
  }
  if (searchParams.affiliation) {
    query = query.ilike('affiliation', `%${searchParams.affiliation}%`)
  }

  const { data } = await query.limit(60)
  return (data || []) as College[]
}

export default async function CollegesPage({
  searchParams,
}: {
  searchParams: { q?: string; location?: string; affiliation?: string }
}) {
  const colleges = await getColleges(searchParams)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Colleges in Nepal</h1>
        </div>
        <p className="text-gray-500">Find and compare colleges across Nepal</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar placeholder="Search college by name..." redirectTo="/colleges" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Location</p>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((loc) => (
                <Link
                  key={loc}
                  href={`/colleges?location=${encodeURIComponent(loc)}`}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    searchParams.location === loc
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {loc}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Affiliation</p>
            <div className="flex flex-wrap gap-2">
              {AFFILIATIONS.map((aff) => (
                <Link
                  key={aff}
                  href={`/colleges?affiliation=${encodeURIComponent(aff)}`}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    searchParams.affiliation === aff
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {aff}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing <span className="font-medium text-gray-700">{colleges.length}</span> colleges
        {searchParams.q && ` for "${searchParams.q}"`}
      </p>

      {/* Grid */}
      {colleges.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {colleges.map((college) => (
            <CollegeCard key={college.id} college={college} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-1">No colleges found</h3>
          <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or search term</p>
          <Link href="/colleges" className="text-sm text-blue-600 font-medium hover:underline">
            Clear filters
          </Link>
        </div>
      )}
    </div>
  )
}
