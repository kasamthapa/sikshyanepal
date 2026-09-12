import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { FACULTIES } from '@/lib/utils'
import type { Program } from '@/types'
import {
  BookOpen,
  Monitor,
  BarChart3,
  Wrench,
  HeartPulse,
  FlaskConical,
  GraduationCap,
  Scale,
  Stethoscope,
  Sprout,
  TreePine,
  Building2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import SearchBar from '@/components/ui/SearchBar'
import { AlertCircle } from 'lucide-react'

const FACULTY_ICONS: Record<string, LucideIcon> = {
  'plus-two':     BookOpen,       // +2 / Intermediate
  'it':           Monitor,
  'management':   BarChart3,
  'engineering':  Wrench,
  'medical':      HeartPulse,
  'humanities':   BookOpen,
  'science':      FlaskConical,
  'education':    GraduationCap,
  'law':          Scale,
  'nursing':      Stethoscope,
  'agriculture':  Sprout,
  'forestry':     TreePine,
  'architecture': Building2,
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'University Programs in Nepal | Bachelor, Master, PhD',
  description: 'Explore all university programs available in Nepal. IT, Engineering, Management, Medical and more.',
}

// Label shown in the chip, value sent in the URL / compared to DB
const DEGREE_LEVELS = [
  { label: '+2 / Intermediate', value: '+2'         },
  { label: 'Bachelor',          value: 'bachelor'   },
  { label: 'Master',            value: 'master'     },
  { label: 'PhD',               value: 'phd'        },
  { label: 'Diploma',           value: 'diploma'    },
  { label: 'Certificate',       value: 'certificate'},
]

async function getPrograms(searchParams: { faculty?: string; degree?: string; q?: string }) {
  const supabase = createServerSupabaseClient()
  let query = supabase.from('programs').select('*').order('faculty').order('name')

  if (searchParams.faculty) {
    if (searchParams.faculty === 'plus-two') {
      // +2 programs are stored with degree_level='+2', not a distinct faculty value
      query = query.eq('degree_level', '+2')
    } else {
      const faculty = FACULTIES.find((f) => f.slug === searchParams.faculty)
      if (faculty) query = query.ilike('faculty', `%${faculty.name.split(' ')[0]}%`)
    }
  }
  if (searchParams.degree) {
    // Values are always lowercase (or '+2') — compare directly, no transform needed
    query = query.eq('degree_level', searchParams.degree)
  }
  if (searchParams.q) query = query.ilike('name', `%${searchParams.q.trim().slice(0, 80)}%`)
  const { data, error } = await query.limit(500)
  return { programs: (data || []) as Program[], loadError: Boolean(error) }
}

function filterUrl(searchParams: { faculty?: string; degree?: string; q?: string }, key: 'faculty' | 'degree', value: string) {
  const params = new URLSearchParams()
  if (searchParams.q) params.set('q', searchParams.q)
  if (searchParams.faculty) params.set('faculty', searchParams.faculty)
  if (searchParams.degree) params.set('degree', searchParams.degree)
  if (params.get(key) === value) params.delete(key)
  else params.set(key, value)
  return `/programs${params.size ? `?${params}` : ''}`
}

export default async function ProgramsPage({ searchParams }: { searchParams: { faculty?: string; degree?: string; q?: string } }) {
  const { programs, loadError } = await getPrograms(searchParams)

  const grouped = programs.reduce((acc, prog) => {
    if (!acc[prog.faculty]) acc[prog.faculty] = []
    acc[prog.faculty].push(prog)
    return acc
  }, {} as Record<string, Program[]>)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </span>
          <h1 className="font-display font-bold text-2xl text-ink" style={{ letterSpacing: '-0.02em' }}>University Programs</h1>
        </div>
        <p className="text-gray-500">Understand study routes, eligibility, fees and colleges from +2 through postgraduate level.</p>
      </div>

      <SearchBar placeholder="Search programs by name…" redirectTo="/programs" initialValue={searchParams.q} className="mb-5" />

      {/* Faculty Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link href={searchParams.q ? `/programs?q=${encodeURIComponent(searchParams.q)}` : '/programs'} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${!searchParams.faculty ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
          All Faculties
        </Link>
        {FACULTIES.map((f) => {
          const Icon = FACULTY_ICONS[f.slug] ?? BookOpen
          const active = searchParams.faculty === f.slug
          return (
            <Link
              key={f.slug}
              href={filterUrl(searchParams, 'faculty', f.slug)}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {f.name}
            </Link>
          )
        })}
      </div>

      {/* Degree Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {DEGREE_LEVELS.map(({ label, value }) => (
          <Link
            key={value}
            href={filterUrl(searchParams, 'degree', value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              searchParams.degree === value
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {(searchParams.faculty || searchParams.degree) && <div className="mb-6 flex flex-wrap items-center gap-2 text-xs"><span className="font-bold text-gray-500">Active filters:</span>{searchParams.faculty&&<Link href={filterUrl(searchParams,'faculty',searchParams.faculty)} className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">Faculty: {FACULTIES.find(item=>item.slug===searchParams.faculty)?.name||searchParams.faculty} ×</Link>}{searchParams.degree&&<Link href={filterUrl(searchParams,'degree',searchParams.degree)} className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">Level: {searchParams.degree === '+2' ? '+2' : searchParams.degree} ×</Link>}</div>}

      {loadError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 py-14 text-center text-amber-950"><AlertCircle className="mx-auto h-10 w-10 text-amber-600"/><h2 className="mt-3 font-display text-xl font-bold">Programs could not load</h2><p className="mt-2 text-sm">This is a temporary connection problem. Please try again.</p><Link href="/programs" className="mt-4 inline-flex rounded-lg bg-amber-950 px-4 py-2 text-sm font-bold text-white">Reload programs</Link></div>
      ) : Object.keys(grouped).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([faculty, progs]) => (
            <div key={faculty}>
              {(() => {
                const matched = FACULTIES.find((f) => f.name.toLowerCase().includes(faculty.toLowerCase().split(' ')[0]))
                const Icon = matched ? (FACULTY_ICONS[matched.slug] ?? BookOpen) : BookOpen
                return (
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </span>
                    {faculty}
                    <Badge variant="gray">{progs.length}</Badge>
                  </h2>
                )
              })()}
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
                        href={`/colleges/program/${prog.slug}`}
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
          <p className="mt-2 text-sm text-gray-500">Try a shorter name or remove one filter.</p>
          <Link href="/programs" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">Clear search and filters</Link>
        </div>
      )}
    </div>
  )
}
