import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import CollegeCard from '@/components/colleges/CollegeCard'
import CollegeFilters from '@/components/colleges/CollegeFilters'
import CollegeSort from '@/components/colleges/CollegeSort'
import SearchBar from '@/components/ui/SearchBar'
import type { College, CollegeProgram, Review } from '@/types'
import { AlertCircle, Building2 } from 'lucide-react'
import AdUnit from '@/components/ads/AdUnit'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: '+2, Bachelor and Master Colleges in Nepal',
  description: 'Browse Nepal colleges for +2, Bachelor, Master, diploma and higher education. Filter by location, affiliation, faculty and level.',
  alternates: { canonical: '/colleges' },
}

// Extended type with server-computed fields the card needs
type RichCollege = College & {
  avg_rating?:   number
  review_count?: number
  fee_min?:      number
  fee_max?:      number
}

const directoryAnswers = [
  {
    question: 'What study levels are included in the Nepal college directory?',
    answer: 'The directory covers post-SEE education: +2, Bachelor, Master, diploma, certificate and other higher-education programmes. Use the level filter to narrow the listings.',
  },
  {
    question: 'How should I compare colleges in Nepal?',
    answer: 'Start with programme availability and affiliation, then compare location, published fees, scholarships, admission requirements and student reviews. Confirm changing details with the college before applying.',
  },
  {
    question: 'Does SikshyaNepal verify every college listing?',
    answer: 'Verification status is shown on individual college profiles. A source-verified profile links to documented source information; an unverified profile should be treated as a starting point and checked directly with the institution.',
  },
]

const PAGE_SIZE = 18

function buildCollegePageUrl(searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== 'page') params.set(key, value)
  })
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return `/colleges${query ? `?${query}` : ''}`
}

function normaliseSearch(value: string | null | undefined) {
  return (value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim()
}

function collegeSearchScore(college: RichCollege, term: string) {
  const name = normaliseSearch(college.name)
  const programNames = (college.programs || []).map(item => normaliseSearch(item.program?.name))
  if (name === term) return 0
  if (name.startsWith(term)) return 1
  if (name.includes(term)) return 2
  if (programNames.some(program => program.startsWith(term))) return 3
  if (programNames.some(program => program.includes(term))) return 4
  if ([college.location, college.district, college.local_level].some(value => normaliseSearch(value).includes(term))) return 5
  if (normaliseSearch(college.affiliation).includes(term)) return 6
  if (normaliseSearch(college.programs_offered).includes(term)) return 7
  return 99
}

function profileCompleteness(college: RichCollege) {
  const checks = [
    college.location || college.district,
    college.affiliation,
    college.education_levels?.length,
    college.programs?.length,
    college.programs?.some(program => program.fee != null),
    college.last_verified_at,
    college.source_url,
  ]
  return checks.filter(Boolean).length
}

function facultyMatches(value: string | null | undefined, requested: string) {
  const faculty = normaliseSearch(value)
  const target = normaliseSearch(requested)
  if (target === 'it') return /\b(it|computing|computer science|information technology)\b/.test(faculty)
  return faculty.includes(target)
}

function matchReasons(college: RichCollege, sp: { faculty?:string;level?:string;province?:string;district?:string;affiliation?:string;maxFee?:string;scholarship?:string;verified?:string;program?:string }) {
  const reasons:string[]=[]
  if(sp.level)reasons.push(`Offers ${sp.level === '+2' ? '+2 / Intermediate' : sp.level.charAt(0).toUpperCase()+sp.level.slice(1)} study`)
  if(sp.faculty)reasons.push(`Has a ${sp.faculty} programme`)
  if(sp.program)reasons.push('Offers your selected programme')
  if(sp.district)reasons.push(`Located in ${sp.district}`);else if(sp.province)reasons.push(`Located in ${sp.province}`)
  if(sp.affiliation)reasons.push(`Matches ${sp.affiliation} affiliation`)
  if(sp.scholarship==='true')reasons.push('Lists scholarship availability')
  if(sp.maxFee&&college.fee_min!=null)reasons.push(`Has a published fee within NPR ${Number(sp.maxFee).toLocaleString('en-NP')}`)
  if(sp.verified==='true')reasons.push('Has documented source verification')
  return reasons
}

async function getColleges(sp: {
  q?:           string
  location?:    string
  affiliation?: string
  faculty?:     string
  level?:       string
  province?: string
  district?: string
  maxFee?: string
  scholarship?: string
  verified?: string
  program?: string
  sort?: string
  page?: string
}): Promise<{ filtered: RichCollege[]; loadError: boolean }> {
  const supabase = createServerSupabaseClient()

  let query = supabase
    .from('colleges')
    .select(`
      *,
      programs:college_programs(
        fee,
        scholarship_available,
        program:programs(id, name, slug, faculty, degree_level)
      ),
      reviews(rating, is_approved)
    `)
    // Only show active colleges (or legacy rows with no status column yet)
    .or('status.eq.active,status.is.null')
    .order('is_featured', { ascending: false })
    .order('name')
    .limit(500)

  if (sp.location)    query = query.ilike('location',    `%${sp.location}%`)
  if (sp.province)    query = query.eq('province', sp.province)
  if (sp.district)    query = query.ilike('district', `%${sp.district}%`)
  if (sp.affiliation) query = query.ilike('affiliation', `%${sp.affiliation}%`)
  if (sp.verified === 'true') query = query.in('verification_status', ['source_verified', 'institution_verified'])

  const { data, error } = await query
  if (error) {
    console.error('Unable to load college directory:', error.message)
    return { filtered: [], loadError: true }
  }
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

  // Program-related constraints must match the same program row. Applying each
  // constraint separately can produce a false match across unrelated programs.
  let filtered = enriched
  const searchTerm = normaliseSearch(sp.q?.slice(0, 80))
  if (searchTerm) filtered = filtered.filter(college => collegeSearchScore(college, searchTerm) < 99)
  const maxFee = Number(sp.maxFee)
  const hasMaxFee = Number.isFinite(maxFee) && maxFee > 0
  const hasProgramConstraint = Boolean(sp.faculty || sp.program || sp.scholarship === 'true' || hasMaxFee)
  if (hasProgramConstraint) {
    const faculty = sp.faculty?.toLowerCase()
    filtered = filtered.filter(college => (college.programs ?? []).some(link => {
      const program = link.program
      if (!program) return false
      if (faculty && !facultyMatches(program.faculty, faculty)) return false
      if (sp.level && program.degree_level !== sp.level) return false
      if (sp.program && program.slug !== sp.program) return false
      if (sp.scholarship === 'true' && !link.scholarship_available) return false
      if (hasMaxFee && (link.fee == null || link.fee > maxFee)) return false
      return true
    }))
  } else if (sp.level) {
    const storedLevel = sp.level === '+2' ? 'plus_two' : sp.level
    filtered = filtered.filter(college =>
      college.education_levels?.includes(storedLevel as NonNullable<College['education_levels']>[number]) ||
      (college.programs ?? []).some(link => link.program?.degree_level === sp.level)
    )
  }

  if (sp.sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name))
  if (sp.sort === 'rating') filtered.sort((a, b) => (b.avg_rating ?? -1) - (a.avg_rating ?? -1) || a.name.localeCompare(b.name))
  if (sp.sort === 'fee-low') filtered.sort((a, b) => (a.fee_min ?? Number.MAX_SAFE_INTEGER) - (b.fee_min ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name))
  if (!sp.sort || sp.sort === 'recommended') filtered.sort((a, b) => searchTerm ? collegeSearchScore(a, searchTerm) - collegeSearchScore(b, searchTerm) || profileCompleteness(b) - profileCompleteness(a) || a.name.localeCompare(b.name) : profileCompleteness(b) - profileCompleteness(a) || a.name.localeCompare(b.name))

  return { filtered, loadError: false }
}

export default async function CollegesPage({
  searchParams,
}: {
  searchParams: { q?: string; location?: string; affiliation?: string; faculty?: string; level?: string; province?: string; district?: string; maxFee?: string; scholarship?: string; verified?: string; program?: string; sort?: string; page?: string }
}) {
  const { filtered, loadError } = await getColleges(searchParams)
  const requestedPage = Number.parseInt(searchParams.page || '1', 10)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), totalPages) : 1
  const visibleColleges = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const pageUrl = absoluteUrl('/colleges')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: '+2, Bachelor and Master Colleges in Nepal',
        description: metadata.description,
        mainEntity: { '@id': `${pageUrl}#college-list` },
        isPartOf: { '@id': `${absoluteUrl('/')}#website` },
      },
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Colleges', path: '/colleges' }]),
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#college-list`,
        name: 'College profiles in Nepal',
        numberOfItems: filtered.length,
        itemListElement: visibleColleges.map((college, index) => ({
          '@type': 'ListItem',
          position: (currentPage - 1) * PAGE_SIZE + index + 1,
          url: absoluteUrl(`/colleges/${college.slug}`),
          name: college.name,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#questions`,
        mainEntity: directoryAnswers.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!loadError && <JsonLd data={jsonLd} />}
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h1 className="font-display text-3xl font-extrabold text-gray-900">Colleges in Nepal</h1>
        </div>
        <p className="text-gray-500 text-sm">Post-SEE study: +2, Bachelor, Master, diploma and higher education</p>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
          Search by programme, location, affiliation and study level. Verification badges show which profiles have documented source checks; always confirm current fees, seats and deadlines before applying.
        </p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <SearchBar placeholder="Search by college, program, place or affiliation…" redirectTo="/colleges" initialValue={searchParams.q} />
      </div>
      <div className="mb-5 flex flex-wrap gap-2 text-xs"><span className="font-semibold text-gray-500">Popular:</span>{['Kathmandu','Pokhara','Chitwan','Lalitpur','Bhaktapur'].map(place=><Link key={place} href={`/colleges/in/${place.toLowerCase()}`} className="font-semibold text-blue-700 hover:underline">Colleges in {place}</Link>)}</div>

      {/* Filters — handles mobile drawer + desktop inline panel + result counts */}
      <CollegeFilters
        searchParams={searchParams}
        filteredCount={filtered.length}
      />

      {!loadError && filtered.length > 0 && <CollegeSort searchParams={searchParams} count={filtered.length} />}

      {/* Grid */}
      {loadError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-12 text-center text-amber-950">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-600" />
          <h2 className="mt-4 font-display text-xl font-bold">College listings could not load</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6">This is a temporary connection problem—not an empty result. Please reload the page in a moment.</p>
          <Link href="/colleges" className="mt-5 inline-flex rounded-xl bg-amber-950 px-5 py-2.5 text-sm font-bold text-white">Try again</Link>
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleColleges.slice(0, 6).map((college) => (
              <CollegeCard key={college.id} college={college} matchReasons={matchReasons(college,searchParams)} />
            ))}
          </div>
          {visibleColleges.length > 6 && (
            <AdUnit
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_COLLEGES ?? ''}
              format="horizontal"
              className="my-5 rounded-xl border border-gray-200 bg-white min-h-[90px]"
            />
          )}
          {visibleColleges.length > 6 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleColleges.slice(6).map((college) => (
                <CollegeCard key={college.id} college={college} matchReasons={matchReasons(college,searchParams)} />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <nav aria-label="College directory pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {currentPage > 1 && <Link href={buildCollegePageUrl(searchParams, currentPage - 1)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary">Previous</Link>}
              <span className="px-3 py-2 text-sm text-gray-600">Page <strong className="text-gray-950">{currentPage}</strong> of {totalPages}</span>
              {currentPage < totalPages && <Link href={buildCollegePageUrl(searchParams, currentPage + 1)} className="rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Next</Link>}
            </nav>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Building2 className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No colleges found</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
            No listing matches every selected option. Remove one filter or try a shorter college name.
          </p>
          <Link
            href={searchParams.q ? `/colleges?q=${encodeURIComponent(searchParams.q)}` : '/colleges'}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Clear filters
          </Link>
        </div>
      )}

      <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8" aria-labelledby="college-directory-questions">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Student guide</p>
        <h2 id="college-directory-questions" className="mt-2 font-display text-2xl font-bold text-gray-950">How to use the college directory</h2>
        <div className="mt-5 divide-y divide-gray-100">
          {directoryAnswers.map(item => (
            <details key={item.question} className="group py-4 first:pt-0 last:pb-0">
              <summary className="cursor-pointer list-none pr-8 text-sm font-semibold text-gray-900 marker:hidden">
                {item.question}<span className="float-right text-blue-600 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">{item.answer}</p>
            </details>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5 text-sm font-semibold">
          <Link href="/compare" className="text-blue-700 hover:underline">Compare shortlisted colleges</Link>
          <Link href="/colleges" className="text-blue-700 hover:underline">Use the college finder</Link>
          <Link href="/about/editorial-policy" className="text-blue-700 hover:underline">Read our verification policy</Link>
        </div>
      </section>
    </div>
  )
}
