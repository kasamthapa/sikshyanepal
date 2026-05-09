import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import NoticeCard from '@/components/notices/NoticeCard'
import SearchBar from '@/components/ui/SearchBar'

export const dynamic = 'force-dynamic'
import type { Notice } from '@/types'
import { Bell } from 'lucide-react'

export const metadata: Metadata = {
  title: 'University Notices Nepal | Admission, Exam & Results | SikshyaNepal',
  description: 'Latest notices from TU, KU, PU and all universities in Nepal. Stay updated with admission deadlines and exam notices.',
}

const UNIVERSITIES = ['TU', 'KU', 'PU', 'PurU', 'RJU']

async function getNotices(searchParams: { q?: string; university?: string }) {
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('notices')
    .select('*, university:universities(id, name, short_name, slug, website, created_at)')
    .order('published_date', { ascending: false })

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }

  const { data } = await query.limit(50)
  let notices = (data || []) as Notice[]

  if (searchParams.university) {
    notices = notices.filter(
      (n) => n.university?.short_name?.toLowerCase() === searchParams.university?.toLowerCase()
    )
  }

  return notices
}

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: { q?: string; university?: string }
}) {
  const notices = await getNotices(searchParams)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">University Notices</h1>
        </div>
        <p className="text-gray-500">Admission deadlines, exam schedules and official announcements</p>
      </div>

      <div className="mb-6">
        <SearchBar placeholder="Search notices..." redirectTo="/notices" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/notices"
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            !searchParams.university ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
          }`}
        >
          All
        </Link>
        {UNIVERSITIES.map((u) => (
          <Link
            key={u}
            href={`/notices?university=${u}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              searchParams.university === u ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {u}
          </Link>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">{notices.length} notices found</p>

      {notices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-1">No notices found</h3>
          <p className="text-sm text-gray-500">Check back later for new notices</p>
        </div>
      )}
    </div>
  )
}
