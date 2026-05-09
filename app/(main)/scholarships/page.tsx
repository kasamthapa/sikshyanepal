import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { formatDateShort } from '@/lib/utils'
import { Award, Calendar, MapPin, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'
import type { Scholarship } from '@/types'

export const metadata: Metadata = {
  title: 'Scholarships in Nepal | College & University Scholarships | SikshyaNepal',
  description: 'Find scholarships available at colleges and universities in Nepal. Merit-based, need-based, and government scholarships.',
}

async function getScholarships() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('scholarships')
    .select('*, college:colleges(name, slug, location)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(50)
  return (data || []) as (Scholarship & { college?: { name: string; slug: string; location: string } | null })[]
}

export default async function ScholarshipsPage() {
  const scholarships = await getScholarships()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Scholarships</h1>
        </div>
        <p className="text-gray-500">Find scholarships to fund your education in Nepal</p>
      </div>

      {scholarships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {scholarships.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{s.title}</h3>
                    {s.college && (
                      <Link href={`/colleges/${s.college.slug}`} className="text-sm text-blue-600 hover:underline">
                        {s.college.name}
                      </Link>
                    )}
                  </div>
                </div>
                {s.amount && (
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-green-700">NPR {s.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">max amount</p>
                  </div>
                )}
              </div>

              {s.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{s.description}</p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {s.college?.location && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5" /> {s.college.location}
                    </span>
                  )}
                  {s.deadline && (
                    <span className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                      <Calendar className="w-3.5 h-3.5" /> Deadline: {formatDateShort(s.deadline)}
                    </span>
                  )}
                </div>
                {s.college && (
                  <Link
                    href={`/colleges/${s.college.slug}`}
                    className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline"
                  >
                    Apply <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-1">No scholarships listed yet</h3>
          <p className="text-sm text-gray-500">Check back soon</p>
        </div>
      )}
    </div>
  )
}
