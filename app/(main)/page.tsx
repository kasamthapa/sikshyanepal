import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { FACULTIES } from '@/lib/utils'
import HeroSearch from '@/components/ui/HeroSearch'
import ResultCard from '@/components/results/ResultCard'
import NoticeCard from '@/components/notices/NoticeCard'
import CollegeCard from '@/components/colleges/CollegeCard'
import EmailSubscribe from '@/components/notifications/EmailSubscribe'
import type { Result, Notice, College } from '@/types'
import type { Admission } from '@/types'
import AdmissionCard from '@/components/admissions/AdmissionCard'
import {
  Building2,
  School,
  FileText,
  Bell,
  CalendarCheck2,
  CalendarClock,
  Newspaper,
  Award,
  ArrowRight,
  Monitor,
  BarChart3,
  Wrench,
  HeartPulse,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Scale,
  Stethoscope,
  Sprout,
  TreePine,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const FACULTY_ICONS: Record<string, LucideIcon> = {
  'plus-two':    BookOpen,      // +2 / Intermediate — first & most prominent
  'it':          Monitor,
  'management':  BarChart3,
  'engineering': Wrench,
  'medical':     HeartPulse,
  'humanities':  BookOpen,
  'science':     FlaskConical,
  'education':   GraduationCap,
  'law':         Scale,
  'nursing':     Stethoscope,
  'agriculture': Sprout,
  'forestry':    TreePine,
  'architecture':Building2,
}

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: { absolute: "SikshyaNepal — Schools, Colleges, Results & Notices in Nepal" },
  description:
    'Find Nepal schools, colleges, programs, exam results, notices and scholarships with sources you can check.',
}

const UNIVERSITY_SHOWCASE = [
  { short: 'TU',   label: 'Tribhuvan University',  affiliation: 'Tribhuvan University' },
  { short: 'KU',   label: 'Kathmandu University',  affiliation: 'Kathmandu University' },
  { short: 'PU',   label: 'Pokhara University',    affiliation: 'Pokhara University' },
  { short: 'PurU', label: 'Purbanchal University', affiliation: 'Purbanchal University' },
]

async function getHomeData() {
  const supabase = createServerSupabaseClient()

  const [
    admissionsRes, resultsRes, noticesRes, collegesRes,
    schoolCountRes, collegeCountRes, programCountRes, universityCountRes,
    tuCountRes, kuCountRes, puCountRes, purUCountRes,
  ] = await Promise.all([
    supabase
      .from('admissions')
      .select('*, school:schools(id,name,slug,district,province), college:colleges(id,name,slug,location)')
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('application_deadline', { ascending: true, nullsFirst: false })
      .limit(4),
    supabase
      .from('results')
      .select('*, university:universities(id, name, short_name, slug, website, created_at)')
      .order('published_date', { ascending: false })
      .limit(6),
    supabase
      .from('notices')
      .select('*, university:universities(id, name, short_name, slug, website, created_at)')
      .order('published_date', { ascending: false })
      .limit(6),
    supabase.from('colleges').select('*').eq('is_featured', true).or('status.eq.active,status.is.null').order('name').limit(6),
    supabase.from('schools').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).or('status.eq.active,status.is.null'),
    supabase.from('programs').select('id',  { count: 'exact', head: true }),
    supabase.from('universities').select('id', { count: 'exact', head: true }),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Tribhuvan%'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Kathmandu%'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Pokhara%'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Purbanchal%'),
  ])

  const collegeCount = collegeCountRes.count ?? 0
  const schoolCount = schoolCountRes.count ?? 0
  const programCount = programCountRes.count ?? 0
  const universityCount = universityCountRes.count ?? 0

  const heroStats = [
    { label: 'Schools',      value: schoolCount },
    { label: 'Colleges',     value: collegeCount },
    { label: 'Programs',     value: programCount },
    { label: 'Universities', value: universityCount },
  ].filter(stat => stat.value > 0)

  const universityCounts: Record<string, number> = {
    TU:   tuCountRes.count   ?? 0,
    KU:   kuCountRes.count   ?? 0,
    PU:   puCountRes.count   ?? 0,
    PurU: purUCountRes.count ?? 0,
  }

  return {
    admissions:       (admissionsRes.data || []) as Admission[],
    results:          (resultsRes.data  || []) as Result[],
    notices:          (noticesRes.data  || []) as Notice[],
    featuredColleges: (collegesRes.data || []) as College[],
    heroStats,
    universityCounts,
  }
}

// ── Hero sidebar card — 3 clean list items ─────────────────────────
function HeroCard({
  result, notice, college,
}: {
  result:  { title: string } | null
  notice:  { title: string } | null
  college: { name: string; slug: string; location?: string | null } | null
}) {
  if (!result && !notice && !college) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card-xl p-5">

      {/* Latest Result */}
      {result && <div className="py-3.5 border-b border-gray-100">
        <p className="mb-1 text-xs font-semibold text-gray-500">
          Latest Result
        </p>
        <p className="text-sm font-medium text-ink leading-snug line-clamp-2">
          {result.title}
        </p>
      </div>}

      {/* Latest Notice */}
      {notice && <div className="py-3.5 border-b border-gray-100">
        <p className="mb-1 text-xs font-semibold text-gray-500">
          Latest Notice
        </p>
        <p className="text-sm font-medium text-ink leading-snug line-clamp-2">
          {notice.title}
        </p>
      </div>}

      {/* Featured College — clickable */}
      {college && <Link
        href={`/colleges/${college.slug}`}
        className="block py-3.5 group"
      >
        <p className="mb-1 text-xs font-semibold text-gray-500">
          Featured College
        </p>
        <p className="text-sm font-medium text-ink leading-snug line-clamp-2 group-hover:text-[#1847c4] transition-colors">
          {college.name}
        </p>
        {college.location && (
          <p className="text-xs text-gray-400 mt-1">{college.location}</p>
        )}
      </Link>}

    </div>
  )
}

export default async function HomePage() {
  const { admissions, results, notices, featuredColleges, heroStats, universityCounts } = await getHomeData()

  const latestResult  = results[0]
  const latestNotice  = notices[0]
  const featuredCollege = featuredColleges[0] ?? null

  return (
    <div>

      {/* ════════════════════════════════════════════════════════
          HERO — two-column, light background
      ════════════════════════════════════════════════════════ */}
      <section className="border-b border-[#e6e4df] bg-[#fcfbf8]">
        <div className="max-w-7xl mx-auto px-4 pb-16 pt-14 sm:px-6 md:pb-20 md:pt-20 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">

            {/* ── Left column (60%) ────────────────────── */}
            <div className="lg:col-span-3">

              {/* Eyebrow */}
              <p className="mb-4 border-l-2 border-[#c93b37] pl-3 text-sm font-semibold text-[#8f302c]">
                An independent education guide for Nepal
              </p>

              {/* Headline */}
              <h1
                className="font-display font-extrabold text-ink leading-[1.1] mb-5 text-balance"
                style={{ fontSize: 'clamp(2.6rem, 5.5vw, 3.75rem)', letterSpacing: '-0.03em' }}
              >
                Compare colleges<br />
                <span className="text-[#1e429f]">before you apply.</span>
              </h1>

              {/* Sub */}
              <p className="mb-8 max-w-xl text-lg leading-8 text-slate-600 md:text-xl">
                Check programmes, published fees, admissions and source dates for colleges across Nepal.
              </p>

              {/* Search */}
              <HeroSearch />

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link href="/schools" className="group border-l-2 border-[#c93b37] bg-white p-4 shadow-sm transition hover:shadow-md"><div className="flex items-start gap-3"><div className="rounded-lg bg-[#fff5f3] p-2"><School className="h-5 w-5 text-[#c93b37]" /></div><div><p className="font-bold text-ink">Looking for a school?</p><p className="mt-1 text-xs leading-5 text-gray-600">ECD to Grade 10, for parents and guardians.</p><span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">Find a school <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span></div></div></Link>
                <Link href="/colleges" className="group border-l-2 border-[#1e429f] bg-white p-4 shadow-sm transition hover:shadow-md"><div className="flex items-start gap-3"><div className="rounded-lg bg-primary-50 p-2"><GraduationCap className="h-5 w-5 text-primary" /></div><div><p className="font-bold text-ink">Planning after SEE or +2?</p><p className="mt-1 text-xs leading-5 text-gray-600">Explore +2, Bachelor, Master and diploma options.</p><span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">Find a college <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span></div></div></Link>
              </div>
            </div>

            {/* ── Right column (40%) — live updates card ─ */}
            <div className="hidden lg:block lg:col-span-2">
              <HeroCard
                result={latestResult  ?? null}
                notice={latestNotice  ?? null}
                college={featuredCollege}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e6e4df] bg-[#f5f3ee]">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2"><h2 className="font-display text-xl font-bold text-ink">What do you need today?</h2><Link href="/search" className="text-sm font-bold text-primary hover:underline">Search everything →</Link></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">{[
            { href: '/results', label: 'Check results', text: 'TU, KU, NEB & more', Icon: FileText },
            { href: '/admissions?deadline=open', label: 'Admissions', text: 'Open & upcoming', Icon: CalendarCheck2 },
            { href: '/schools', label: 'Find a school', text: 'ECD to Grade 10', Icon: School },
            { href: '/colleges', label: 'Find a college', text: '+2 and higher', Icon: GraduationCap },
            { href: '/scholarships', label: 'Scholarships', text: 'Funding options', Icon: Award },
            { href: '/entrance-exams', label: 'Entrance exams', text: 'Dates & eligibility', Icon: CalendarClock },
            { href: '/study-resources', label: 'Study resources', text: 'Syllabus & questions', Icon: BookOpen },
            { href: '/notices', label: 'Latest notices', text: 'Official updates', Icon: Bell },
          ].map(({ href, label, text, Icon }) => <Link key={href} href={href} className="group border border-gray-200 bg-white p-4 transition hover:border-primary"><span className="flex h-8 w-8 items-center justify-center border border-gray-200 bg-[#f8f7f3] text-primary"><Icon className="h-4 w-4" /></span><p className="mt-3 text-sm font-bold text-ink">{label}</p><p className="mt-1 text-xs text-gray-500">{text}</p></Link>)} </div>
        </div>
      </section>

      {admissions.length > 0 && (
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-7 flex items-end justify-between gap-4"><h2 className="font-display text-3xl font-bold text-ink">Admissions open now</h2><Link href="/admissions" className="text-sm font-bold text-primary">All admissions →</Link></div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{admissions.map((admission) => <AdmissionCard key={admission.id} admission={admission} />)}</div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          STATS BAR — dark navy
      ════════════════════════════════════════════════════════ */}
      {heroStats.length > 0 && <section style={{ backgroundColor: '#0d1b3e' }} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center sm:justify-between gap-0 divide-x divide-white/20">
            {heroStats.map((stat) => (
              <div key={stat.label} className="px-8 py-2 text-center">
                <p className="font-mono text-white text-2xl leading-none" style={{ letterSpacing: '-0.02em' }}>
                  <span style={{ fontWeight: 800 }}>{stat.value.toLocaleString()}</span>
                  {' '}
                  <span className="font-normal" style={{ opacity: 0.6 }}>{stat.label.toLowerCase()}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* ════════════════════════════════════════════════════════
          EMAIL SUBSCRIBE BAR
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#1847c4] border-b border-[#1340b0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-white flex-shrink-0 text-center sm:text-left">
              <p className="font-semibold text-sm flex items-center gap-2 justify-center sm:justify-start">
                <Bell className="w-4 h-4" />
                Get result alerts in your inbox
              </p>
              <p className="text-blue-200 text-xs mt-0.5">Email updates when a new result or notice is published</p>
            </div>
            <div className="w-full sm:flex-1 max-w-sm sm:max-w-none">
              <EmailSubscribe />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          LATEST RESULTS — subtle blue bg
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#f0f4ff] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display font-bold text-3xl text-ink" style={{ letterSpacing: '-0.025em' }}>
              Results &amp; Notices
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Results panel */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-[#1847c4]" />
                  </div>
                  <span className="text-sm font-semibold text-ink">Latest Results</span>
                </div>
                <Link href="/results"
                  className="text-sm font-semibold text-[#1847c4] hover:text-[#1340b0] transition-colors duration-150">
                  View all
                </Link>
              </div>
              {results.length > 0 ? (
                <div>
                  {results.slice(0, 5).map((r) => (
                    <ResultCard key={r.id} result={r} compact />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-6 text-center">No results yet</p>
              )}
            </div>

            {/* Notices panel */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <span className="text-sm font-semibold text-ink">University Notices</span>
                </div>
                <Link href="/notices"
                  className="text-sm font-semibold text-[#1847c4] hover:text-[#1340b0] transition-colors duration-150">
                  View all
                </Link>
              </div>
              {notices.length > 0 ? (
                <div>
                  {notices.slice(0, 5).map((n) => (
                    <NoticeCard key={n.id} notice={n} compact />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-6 text-center">No notices yet</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURED COLLEGES — white
      ════════════════════════════════════════════════════════ */}
      {featuredColleges.length > 0 && (
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Featured</p>
                <h2 className="font-display font-bold text-3xl text-ink" style={{ letterSpacing: '-0.025em' }}>
                  Featured Colleges
                </h2>
              </div>
              <Link href="/colleges"
                className="hidden sm:block text-sm font-semibold text-[#1847c4] hover:text-[#1340b0] transition-colors duration-150">
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredColleges.map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>

            <div className="mt-7 sm:hidden text-center">
              <Link href="/colleges" className="btn-primary inline-flex">
                <Building2 className="w-4 h-4" />
                Explore All Colleges
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          BROWSE BY PROGRAM — subtle bg
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#f0f4ff] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display font-bold text-3xl text-ink" style={{ letterSpacing: '-0.025em' }}>
              Browse by Program
            </h2>
            <Link href="/programs"
              className="hidden sm:block text-sm font-semibold text-[#1847c4] hover:text-[#1340b0] transition-colors duration-150">
              All programs
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {FACULTIES.map((faculty) => {
              const Icon = FACULTY_ICONS[faculty.slug] ?? Monitor
              // +2 Programs links to college filter (level=+2) — most relevant for post-SEE students
              const href = faculty.slug === 'plus-two'
                ? '/colleges?level=%2B2'
                : `/programs?faculty=${faculty.slug}`
              const isPlus2 = faculty.slug === 'plus-two'
              return (
                <Link
                  key={faculty.slug}
                  href={href}
                  className={`group flex flex-col items-center gap-3 border p-5 text-center transition-colors
                             ${isPlus2 ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}
                             hover:border-primary`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center border ${isPlus2 ? 'border-amber-200 bg-white' : 'border-gray-200 bg-[#f8f7f3]'}`}>
                    <Icon className={`h-6 w-6 ${isPlus2 ? 'text-amber-700' : 'text-primary'}`} />
                  </div>
                  <span className={`text-sm font-semibold leading-tight ${isPlus2 ? 'text-amber-800' : 'text-gray-900'} group-hover:text-primary`}>
                    {faculty.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          BROWSE BY UNIVERSITY — white
      ════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display font-bold text-3xl text-ink" style={{ letterSpacing: '-0.025em' }}>
              Browse by University
            </h2>
            <Link href="/colleges"
              className="hidden sm:block text-sm font-semibold text-[#1847c4] hover:text-[#1340b0] transition-colors duration-150">
              All colleges
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {UNIVERSITY_SHOWCASE.map((u) => {
              const count = universityCounts[u.short] ?? 0
              return (
                <Link
                  key={u.short}
                  href={`/colleges?affiliation=${encodeURIComponent(u.affiliation)}`}
                  className="group flex flex-col gap-3 border border-gray-200 bg-white p-5 transition-colors hover:border-primary"
                >
                  <div className="flex h-11 w-11 items-center justify-center border border-gray-200 bg-[#f8f7f3]">
                    <span className="font-display text-lg font-bold text-primary">{u.short}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{u.label}</p>
                    {count > 0 && (
                      <p className="text-xs text-gray-400 mt-1">{count} college{count !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-[#1847c4]">
                    Browse colleges
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PROMO CARDS — subtle bg
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#f0f4ff] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/news"
              className="group flex items-center gap-4 p-5 rounded-2xl border border-gray-200 bg-white
                         hover:border-[#1847c4] hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Newspaper className="w-5 h-5 text-[#1847c4]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-ink text-sm">Education News</h3>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">Latest from Nepal&apos;s education sector</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-[#1847c4] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link href="/scholarships"
              className="group flex items-center gap-4 p-5 rounded-2xl border border-gray-200 bg-white
                         hover:border-[#f97316] hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-ink text-sm">Scholarships</h3>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">Find funding for your education</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link href="/compare"
              className="group flex items-center gap-4 p-5 rounded-2xl border border-gray-200 bg-white
                         hover:border-[#1847c4] hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-ink text-sm">Compare Colleges</h3>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">Side-by-side college comparison</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          APPLICATION CHECK — dark navy
      ════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#0d1b3e' }} className="py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-display font-bold text-white text-4xl mb-2" style={{ letterSpacing: '-0.025em' }}>
            Check the current notice before you pay.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            Fees, seats and deadlines can change. Each college profile shows its source and last-checked date when available.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/colleges"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                         bg-[#1847c4] text-white text-sm font-semibold hover:bg-[#1340b0] transition-colors"
            >
              Browse colleges
            </Link>
            <Link
              href="/results"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                         bg-white/8 text-white text-sm font-semibold border border-white/15
                         hover:bg-white/15 transition-colors"
            >
              Check Results
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
