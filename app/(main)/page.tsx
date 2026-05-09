import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { FACULTIES } from '@/lib/utils'

export const dynamic = 'force-dynamic'
import SearchBar from '@/components/ui/SearchBar'
import ResultCard from '@/components/results/ResultCard'
import NoticeCard from '@/components/notices/NoticeCard'
import CollegeCard from '@/components/colleges/CollegeCard'
import type { Result, Notice, College } from '@/types'
import {
  GraduationCap,
  Building2,
  BookOpen,
  FileText,
  Bell,
  Newspaper,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'SikshyaNepal - Nepal\'s #1 Education Portal | Colleges, Results & Notices',
  description:
    'Find colleges, university programs, exam results, notices, scholarships, and education news in Nepal. Complete guide for Nepali students.',
  keywords: 'Nepal education, colleges Nepal, TU results, KU notice, Nepal university, college admission Nepal',
  openGraph: {
    title: 'SikshyaNepal - Nepal\'s #1 Education Portal',
    description: 'Find colleges, university programs, exam results, notices, scholarships, and education news in Nepal.',
    type: 'website',
  },
}

const STATS = [
  { label: 'Colleges Listed', value: '500+', icon: Building2, color: 'text-blue-600 bg-blue-50' },
  { label: 'Programs Available', value: '50+', icon: BookOpen, color: 'text-green-600 bg-green-50' },
  { label: 'Daily Results', value: 'Live', icon: FileText, color: 'text-orange-600 bg-orange-50' },
  { label: 'Scholarships', value: '200+', icon: Award, color: 'text-purple-600 bg-purple-50' },
]

const QUICK_LINKS = [
  { label: 'TU Results', href: '/results?university=tu', color: 'bg-blue-600 hover:bg-blue-700' },
  { label: 'KU Notices', href: '/notices?university=ku', color: 'bg-green-600 hover:bg-green-700' },
  { label: 'NEB Results', href: '/results?university=neb', color: 'bg-red-600 hover:bg-red-700' },
  { label: 'Admission 2081', href: '/notices?type=admission', color: 'bg-purple-600 hover:bg-purple-700' },
  { label: 'Entrance Exams', href: '/notices?type=entrance', color: 'bg-orange-600 hover:bg-orange-700' },
  { label: 'Scholarships', href: '/scholarships', color: 'bg-teal-600 hover:bg-teal-700' },
]

async function getHomeData() {
  const supabase = createServerSupabaseClient()

  const [resultsRes, noticesRes, collegesRes] = await Promise.all([
    supabase
      .from('results')
      .select('*, university:universities(id, name, short_name, slug, website, created_at)')
      .order('published_date', { ascending: false })
      .limit(5),
    supabase
      .from('notices')
      .select('*, university:universities(id, name, short_name, slug, website, created_at)')
      .order('published_date', { ascending: false })
      .limit(5),
    supabase
      .from('colleges')
      .select('*')
      .eq('is_featured', true)
      .limit(6),
  ])

  return {
    results: (resultsRes.data || []) as Result[],
    notices: (noticesRes.data || []) as Notice[],
    featuredColleges: (collegesRes.data || []) as College[],
  }
}

export default async function HomePage() {
  const { results, notices, featuredColleges } = await getHomeData()

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Nepal&apos;s Most Trusted Education Portal</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
              Find Your Perfect College in{' '}
              <span className="text-yellow-300">Nepal</span>
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Compare colleges, check exam results, read university notices, and discover scholarships — all in one place.
            </p>

            {/* Search */}
            <SearchBar
              placeholder="Search colleges, programs, universities..."
              redirectTo="/colleges"
              size="lg"
              className="max-w-2xl mx-auto"
            />

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {QUICK_LINKS.map((ql) => (
                <Link
                  key={ql.label}
                  href={ql.href}
                  className={`px-4 py-1.5 ${ql.color} text-white text-sm font-medium rounded-full transition-colors`}
                >
                  {ql.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Results + Notices Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Latest Results */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Latest Results</h2>
              </div>
              <Link
                href="/results"
                className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {results.length > 0 ? (
              <div>
                {results.map((result) => (
                  <ResultCard key={result.id} result={result} compact />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results published yet</p>
              </div>
            )}
          </div>

          {/* Latest Notices */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">University Notices</h2>
              </div>
              <Link
                href="/notices"
                className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {notices.length > 0 ? (
              <div>
                {notices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} compact />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notices published yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Browse by Faculty */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Browse by Faculty</h2>
            <Link href="/programs" className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              All Programs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {FACULTIES.map((faculty) => (
              <Link
                key={faculty.slug}
                href={`/programs?faculty=${faculty.slug}`}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all group text-center"
              >
                <span className="text-2xl">{faculty.icon}</span>
                <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors leading-tight">
                  {faculty.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Colleges */}
        {featuredColleges.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Featured Colleges</h2>
              </div>
              <Link href="/colleges" className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                All Colleges <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredColleges.map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
            <div className="text-center mt-6">
              <Link
                href="/colleges"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Explore All Colleges
              </Link>
            </div>
          </section>
        )}

        {/* News + Resources Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <Link
            href="/news"
            className="col-span-1 flex items-center gap-4 p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            <Newspaper className="w-8 h-8 opacity-90 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Education News</h3>
              <p className="text-sm text-blue-100">Latest updates from Nepal&apos;s education sector</p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto flex-shrink-0" />
          </Link>
          <Link
            href="/scholarships"
            className="col-span-1 flex items-center gap-4 p-5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 transition-all"
          >
            <Award className="w-8 h-8 opacity-90 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Scholarships</h3>
              <p className="text-sm text-green-100">Find funding for your education</p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto flex-shrink-0" />
          </Link>
          <Link
            href="/compare"
            className="col-span-1 flex items-center gap-4 p-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl hover:from-purple-700 hover:to-purple-800 transition-all"
          >
            <Building2 className="w-8 h-8 opacity-90 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Compare Colleges</h3>
              <p className="text-sm text-purple-100">Side-by-side college comparison</p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto flex-shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  )
}
