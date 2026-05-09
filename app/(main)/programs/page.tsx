import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { FACULTIES } from '@/lib/utils'
import type { Program } from '@/types'
import { BookOpen } from 'lucide-react'
import Badge from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'University Programs in Nepal | Bachelor, Master, PhD | SikshyaNepal',
  description: 'Explore all university programs available in Nepal. IT, Engineering, Management, Medical and more.',
}

const DEGREE_LEVELS = ['bachelor', 'master', 'phd', 'diploma', 'certificate']

async function getPrograms(searchParams: { faculty?: string; degree?: string }) {
  const supabase = createServerSupabaseClient()
  let query = supabase.from('programs').select('*').order('faculty').order('name')
  if (searchParams.faculty) {
    const faculty = FACULTIES.find((f) => f.slug === searchParams.faculty)
    if (faculty) query = query.ilike('faculty', `%${faculty.name.split(' ')[0]}%`)
  }
  if (searchParams.degree) {
    query = query.eq('degree_level', searchParams.degree)
  }
  const { data } = await query
  return (data || []) as Program[]
}

export default async function ProgramsPage({ searchParams }: { searchParams: { faculty?: string; degree?: string } }) {
  const programs = await getPrograms(searchParams)

  const grouped = programs.reduce((acc, prog) => {
    if (!acc[prog.faculty]) acc[prog.faculty] = []
    acc[prog.faculty].push(prog)
    return acc
  }, {} as Record<string, Program[]>)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">University Programs</h1>
        </div>
        <p className="text-gray-500">Explore all programs offered by universities in Nepal</p>
      </div>

      {/* Faculty Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link href="/programs" className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${!searchParams.faculty ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
          All Faculties
        </Link>
        {FACULTIES.map((f) => (
          <Link key={f.slug} href={`/programs?faculty=${f.slug}`} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${searchParams.faculty === f.slug ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
            {f.icon} {f.name}
          </Link>
        ))}
      </div>

      {/* Degree Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {DEGREE_LEVELS.map((d) => (
          <Link key={d} href={`/programs?${searchParams.faculty ? `faculty=${searchParams.faculty}&` : ''}degree=${d}`}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize ${searchParams.degree === d ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
            {d}
          </Link>
        ))}
      </div>

      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([faculty, progs]) => (
            <div key={faculty}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>{FACULTIES.find((f) => f.name.includes(faculty))?.icon || '📚'}</span>
                {faculty}
                <Badge variant="gray">{progs.length}</Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {progs.map((prog) => (
                  <div key={prog.id} className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/programs/${prog.slug}`} className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{prog.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="blue" className="capitalize">{prog.degree_level}</Badge>
                          <span className="text-xs text-gray-500">{prog.duration}</span>
                        </div>
                      </Link>
                      <Link
                        href={`/colleges?program=${prog.slug}`}
                        className="text-xs text-blue-600 font-medium whitespace-nowrap hover:underline flex-shrink-0"
                      >
                        Find Colleges
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-1">No programs found</h3>
        </div>
      )}
    </div>
  )
}
