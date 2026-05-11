import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import NoticeCard from '@/components/notices/NoticeCard'
import SearchBar from '@/components/ui/SearchBar'
import type { Notice } from '@/types'
import { Bell, RefreshCcw } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'University Notices Nepal | Admission, Exam & Results | SikshyaNepal',
  description: 'Latest notices from TU, KU, PU and all universities in Nepal. Stay updated with admission deadlines and exam notices.',
}

const UNIVERSITIES = ['TU', 'KU', 'PU', 'PurU', 'NEB', 'CTEVT']

async function getNotices(sp: { q?: string; university?: string }) {
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('notices')
    .select('*, university:universities(id, name, short_name, slug, website, created_at)')
    .order('published_date', { ascending: false }) // newest first — confirmed

  if (sp.q) query = query.ilike('title', `%${sp.q}%`)

  const { data } = await query.limit(100)
  let notices = (data || []) as Notice[]

  if (sp.university) {
    notices = notices.filter(
      (n) => n.university?.short_name?.toLowerCase() === sp.university?.toLowerCase()
    )
  }

  return notices
}

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: { q?: string; university?: string }
}) {
  const notices    = await getNotices(searchParams)
  const hasFilter  = !!(searchParams.university || searchParams.q)

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
      active
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
    }`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">University Notices</h1>
        </div>
        <p className="text-gray-500 text-sm">Admission deadlines, exam schedules and official announcements</p>
      </div>

      <div className="mb-5">
        <SearchBar placeholder="Search notices..." redirectTo="/notices" />
      </div>

      {/* University filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Link href="/notices" className={pill(!searchParams.university)}>All</Link>
        {UNIVERSITIES.map((u) => (
          <Link
            key={u}
            href={searchParams.q ? `/notices?q=${encodeURIComponent(searchParams.q)}&university=${u}` : `/notices?university=${u}`}
            className={pill(searchParams.university === u)}
          >
            {u}
          </Link>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 mb-4">
        <span className="font-semibold text-gray-900">{notices.length}</span> notice{notices.length !== 1 ? 's' : ''} found
        {searchParams.q && <> for &quot;{searchParams.q}&quot;</>}
      </p>

      {notices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Bell className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No notices found</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
            {hasFilter
              ? 'Try removing some filters or searching with different keywords.'
              : 'New notices will appear here as soon as they are published by universities.'}
          </p>
          {hasFilter && (
            <Link
              href="/notices"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Clear all filters
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
